import React, { createContext, useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const HomeContext = createContext(null)

const DEVICE_ICONS = {
  light: '💡',
  ac: '❄️',
  tv: 'tv',
  fan: '🌀',
  purifier: '🌬️',
  speaker: '🔊',
  lock: '🔒',
  camera: '📷',
  vacuum: '🤖',
  wifi: '📶',
  other: '🔌',
}

const INITIAL_ROOMS = []

const INITIAL_MEMBERS = [
  { id: uuidv4(), name: 'You (Admin)', role: 'Admin', avatar: '👤' },
]

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
  const [rooms, setRooms] = useState(INITIAL_ROOMS)
  const [members, setMembers] = useState(INITIAL_MEMBERS)
  const [notifications, setNotifications] = useState([
    { id: uuidv4(), text: 'Pay electricity bill before Aug 3rd', type: 'warning', time: '2h ago' },
    { id: uuidv4(), text: 'Sara requesting to unlock the main door', type: 'action', time: '5m ago' },
    { id: uuidv4(), text: 'Front door locked automatically at 11 PM', type: 'info', time: '8h ago' },
  ])
  const [doorLocked, setDoorLocked] = useState(true)
  const [powerPeriod, setPowerPeriod] = useState('week')
  const [userName] = useState('Home Owner')

  // Room actions
  const addRoom = (name, icon) => {
    setRooms(prev => [...prev, { id: uuidv4(), name, icon, devices: [] }])
  }
  const editRoom = (roomId, name, icon) => {
  setRooms(prev => prev.map(r => r.id === roomId ? { ...r, name, icon } : r))
}
  const removeRoom = (roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId))
  }

  // Device actions
  const addDevice = (roomId, name, type) => {
    setRooms(prev => prev.map(r =>
      r.id === roomId
        ? { ...r, devices: [...r.devices, { id: uuidv4(), name, type, on: false, value: null }] }
        : r
    ))
  }
  const toggleDevice = (roomId, deviceId) => {
    setRooms(prev => prev.map(r =>
      r.id === roomId
        ? { ...r, devices: r.devices.map(d => d.id === deviceId ? { ...d, on: !d.on } : d) }
        : r
    ))
  }
  const removeDevice = (roomId, deviceId) => {
    setRooms(prev => prev.map(r =>
      r.id === roomId
        ? { ...r, devices: r.devices.filter(d => d.id !== deviceId) }
        : r
    ))
  }
  const renameDevice = (roomId, deviceId, newName) => {
    setRooms(prev => prev.map(r =>
      r.id !== roomId ? r : {
        ...r,
        devices: r.devices.map(d =>
          d.id !== deviceId ? d : { ...d, name: newName }
        )
      }
    ))
  }

  // Members
  const addMember = (name, role) => {
    setMembers(prev => [...prev, { id: uuidv4(), name, role, avatar: '👤' }])
  }
  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  // Notifications
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Computed stats
  const totalDevices = rooms.reduce((s, r) => s + r.devices.length, 0)
  const activeDevices = rooms.reduce((s, r) => s + r.devices.filter(d => d.on).length, 0)
  const powerData = POWER_DATA[powerPeriod]

  return (
    <HomeContext.Provider value={{
      rooms, addRoom, removeRoom, editRoom,
      addDevice, toggleDevice, removeDevice, renameDevice,
      members, addMember, removeMember,
      notifications, dismissNotification,
      doorLocked, setDoorLocked,
      powerPeriod, setPowerPeriod, powerData,
      userName, totalDevices, activeDevices,
      DEVICE_ICONS,
    }}>
      {children}
    </HomeContext.Provider>
  )
}

export function useHome() { return useContext(HomeContext) }
