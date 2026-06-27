import React, { createContext, useContext, useState, useEffect } from 'react'

const HomeContext = createContext(null)

const API = '/api'

const DEVICE_ICONS = {
  light: '💡',
  ac: '❄️',
  tv: '📺',
  fan: '🌀',
  purifier: '🌬️',
  speaker: '🔊',
  lock: '🔒',
  camera: '📷',
  vacuum: '🤖',
  wifi: '📶',
  other: '🔌',
}

const POWER_DATA = {
  week: [
    { day: 'Mon', kwh: 18 }, { day: 'Tue', kwh: 22 }, { day: 'Wed', kwh: 15 },
    { day: 'Thu', kwh: 28 }, { day: 'Fri', kwh: 32 }, { day: 'Sat', kwh: 24 }, { day: 'Sun', kwh: 19 },
  ],
  month: [
    { day: 'W1', kwh: 110 }, { day: 'W2', kwh: 145 }, { day: 'W3', kwh: 120 }, { day: 'W4', kwh: 160 },
  ],
}

export function HomeProvider({ children }) {
  const [rooms, setRooms] = useState([])
  const [members, setMembers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [doorLocked, setDoorLocked] = useState(true)
  const [powerPeriod, setPowerPeriod] = useState('week')
  const [homeName, setHomeNameState] = useState('AutoHome')
  const [userName, setUserName] = useState('Home Owner')
  const [loading, setLoading] = useState(true)

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token')
  const getUserId = () => localStorage.getItem('userId')

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  })

  // ─── LOAD ALL DATA ON MOUNT ───────────────────────────────
  useEffect(() => {
  const token = getToken()
  if (!token) { 
    setLoading(false)
    setRooms([])
    setMembers([])
    setNotifications([])
    return 
  }
  loadAll()
}, [])
  const loadAll = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadRooms(),
        loadMembers(),
        loadAlerts(),
        loadSettings(),
      ])
    } catch (err) {
      console.error('Load error:', err)
    }
    setLoading(false)
  }

  // ─── ROOMS ────────────────────────────────────────────────
  const loadRooms = async () => {
    try {
      const res = await fetch(`${API}/rooms`, { headers: authHeaders() })
      const data = await res.json()
      if (!Array.isArray(data)) return

      // For each room, load its devices
      const roomsWithDevices = await Promise.all(
        data.map(async (r) => {
          const devRes = await fetch(`${API}/devices/${r.room_id}`, { headers: authHeaders() })
          const devData = await devRes.json()
          const devices = Array.isArray(devData) ? devData.map(d => ({
  id: d.appliance_id,
  name: d.appliance_name,
  
  on: d.power === 1,
  gpio: d.gpio_pin,
})) : []
          return {
            id: r.room_id,
            name: r.room_name,
            icon: r.icon || 'sofa',
            devices,
          }
        })
      )
      setRooms(roomsWithDevices)
    } catch (err) {
      console.error('loadRooms error:', err)
    }
  }

  const addRoom = async (name, icon) => {
    try {
      const res = await fetch(`${API}/rooms`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ room_name: name, icon }),
      })
      const data = await res.json()
      setRooms(prev => [...prev, {
        id: data.room_id,
        name: data.room_name,
        icon: data.icon || icon,
        devices: [],
      }])
    } catch (err) {
      console.error('addRoom error:', err)
    }
  }

  const editRoom = async (roomId, name, icon) => {
    try {
      await fetch(`${API}/rooms/${roomId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ room_name: name, icon }),
      })
      setRooms(prev => prev.map(r =>
        r.id === roomId ? { ...r, name, icon } : r
      ))
    } catch (err) {
      console.error('editRoom error:', err)
    }
  }

  const removeRoom = async (roomId) => {
    try {
      await fetch(`${API}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      setRooms(prev => prev.filter(r => r.id !== roomId))
    } catch (err) {
      console.error('removeRoom error:', err)
    }
  }

  // ─── DEVICES ──────────────────────────────────────────────
  const addAppliance = async (roomId, name, type, gpioPin = 0) => {
  try {
    const res = await fetch(`${API}/appliances`, {
      method: 'POST',
      headers: authHeaders(),
     body: JSON.stringify({
  appliance_name: name,
  
  gpio_pin: gpioPin,
  room_id: roomId,
}),
      })
      const data = await res.json()
      setRooms(prev => prev.map(r =>
        r.id === roomId
          ? { ...r, devices: [...r.devices, {
              id: data.appliance_id,
            name: data.appliance_name,

              on: false,
              gpio: data.gpio_pin,
            }]}
          : r
      ))
    } catch (err) {
      console.error('addDevice error:', err)
    }
  }

  const toggleDevice = async (roomId, deviceId) => {
    // Optimistic update first
    let newState = false
    setRooms(prev => prev.map(r =>
      r.id === roomId
        ? { ...r, devices: r.devices.map(d => {
            if (d.id === deviceId) {
              newState = !d.on
              return { ...d, on: newState }
            }
            return d
          })}
        : r
    ))
    try {
      await fetch(`${API}/devices/${deviceId}/toggle`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ power_state: newState }),
      })
    } catch (err) {
      console.error('toggleDevice error:', err)
      // Revert on failure
      setRooms(prev => prev.map(r =>
        r.id === roomId
          ? { ...r, devices: r.devices.map(d =>
              d.id === deviceId ? { ...d, on: !newState } : d
            )}
          : r
      ))
    }
  }

  const removeDevice = async (roomId, deviceId) => {
    try {
      await fetch(`${API}/devices/${deviceId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      setRooms(prev => prev.map(r =>
        r.id === roomId
          ? { ...r, devices: r.devices.filter(d => d.id !== deviceId) }
          : r
      ))
    } catch (err) {
      console.error('removeDevice error:', err)
    }
  }

  const renameDevice = async (roomId, deviceId, newName) => {
    try {
      await fetch(`${API}/devices/${deviceId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ appliance_name: newName }),
      })
      setRooms(prev => prev.map(r =>
        r.id !== roomId ? r : {
          ...r,
          devices: r.devices.map(d =>
            d.id !== deviceId ? d : { ...d, name: newName }
          )
        }
      ))
    } catch (err) {
      console.error('renameAppliance error:', err)
    }
  }

  // ─── MEMBERS ──────────────────────────────────────────────
  const loadMembers = async () => {
  try {
    const res = await fetch(`${API}/members`, { headers: authHeaders() })
    const data = await res.json()
    const savedUser = JSON.parse(localStorage.getItem('smarthome_user') || '{}')
    const mapped = Array.isArray(data) ? data.map(m => ({
      id: m.member_id,
      name: m.name,
      role: m.role,
      avatar: m.avatar || '👤',
    })) : []
    setMembers([
      { id: 'admin', name: savedUser.name || 'You (Admin)', role: 'Admin', avatar: '👤' },
      ...mapped,
    ])
  } catch (err) {
    console.error('loadMembers error:', err)
    const savedUser = JSON.parse(localStorage.getItem('smarthome_user') || '{}')
    setMembers([
      { id: 'admin', name: savedUser.name || 'You (Admin)', role: 'Admin', avatar: '👤' },
    ])
  }
}

  const addMember = async (name, role) => {
    try {
      const res = await fetch(`${API}/members`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, role }),
      })
      const data = await res.json()
      setMembers(prev => [...prev, {
        id: data.member_id,
        name: data.name,
        role: data.role,
        avatar: '👤',
      }])
    } catch (err) {
      console.error('addMember error:', err)
    }
  }

  const removeMember = async (id) => {
    try {
      await fetch(`${API}/members/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      setMembers(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      console.error('removeMember error:', err)
    }
  }

  // ─── ALERTS ───────────────────────────────────────────────
  const loadAlerts = async () => {
    try {
      const res = await fetch(`${API}/alerts`, { headers: authHeaders() })
      const data = await res.json()
      if (!Array.isArray(data)) return
      setNotifications(data.map(a => ({
        id: a.alert_id,
        text: a.message,
        type: a.type,
        time: new Date(a.created_at).toLocaleTimeString(),
      })))
    } catch (err) {
      console.error('loadAlerts error:', err)
    }
  }

  const dismissNotification = async (id) => {
    try {
      await fetch(`${API}/alerts/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('dismissNotification error:', err)
    }
  }

  // ─── HOME SETTINGS ────────────────────────────────────────
  const loadSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`, { headers: authHeaders() })
      const data = await res.json()
      if (data.home_name) setHomeNameState(data.home_name)
      if (data.user_name) setUserName(data.user_name)
    } catch (err) {
      console.error('loadSettings error:', err)
    }
  }

  const setHomeName = async (name) => {
    setHomeNameState(name)
    try {
      await fetch(`${API}/settings`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ home_name: name }),
      })
    } catch (err) {
      console.error('setHomeName error:', err)
    }
  }

  // ─── COMPUTED ─────────────────────────────────────────────
  const totalDevices = rooms.reduce((s, r) => s + r.devices.length, 0)
  const activeDevices = rooms.reduce((s, r) => s + r.devices.filter(d => d.on).length, 0)
  const powerData = POWER_DATA[powerPeriod]

  return (
    <HomeContext.Provider value={{
      rooms, addRoom, removeRoom, editRoom,
      addAppliance, toggleDevice, removeDevice, renameDevice,
      members, addMember, removeMember,
      notifications, dismissNotification,
      doorLocked, setDoorLocked,
      powerPeriod, setPowerPeriod, powerData,
      homeName, setHomeName,
      userName, totalDevices, activeDevices,
      loading, loadAll,
      DEVICE_ICONS,
    }}>
      {children}
    </HomeContext.Provider>
  )
}

export function useHome() { return useContext(HomeContext) }