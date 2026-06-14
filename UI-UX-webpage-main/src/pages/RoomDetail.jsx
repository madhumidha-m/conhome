import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useHome } from '../context/HomeContext'
import DeviceCard from '../components/DeviceCard'
import Modal from '../components/Modal'
import styles from './RoomDetail.module.css'

export default function RoomDetail() {
  const { roomId } = useParams()
  const { rooms, addDevice } = useHome()
  const room = rooms.find(r => r.id === roomId)

  const [showModal, setShowModal] = useState(false)
  const [devName, setDevName] = useState('')
  const [devType, setDevType] = useState(0)
  const [devConn, setDevConn] = useState('local')
  const [deviceType, setDeviceType] = useState('light')

  if (!room) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <p>Room not found. <Link to="/rooms">Go back</Link></p>
    </div>
  )

  const handleAdd = () => {
  if (!devName.trim()) return
  addDevice(roomId, devName.trim() , devType)
  setDevName('')
  setDevType(0)
  setDevConn('local')
  setShowModal(false)
}

  const activeCount = room.devices.filter(d => d.on).length

  const ROOM_ICONS_MAP = {
    sofa: '🛋️', bed: '🛏️', kitchen: '🍳', shower: '🚿',
    study: '📚', gym: '🏋️', game: '🎮', garden: '🌿',
    bath: '🛁', office: '🖥️', garage: '🚗', laundry: '🧺'
  }

  return (
    <div>
      <div className={styles.header}>
        <Link to="/rooms" className={styles.back}>← Rooms</Link>
        <div className={styles.titleRow}>
          <span className={styles.roomIcon}>
            {ROOM_ICONS_MAP[room.icon] || room.icon}
          </span>
          <div>
            <h1 className={styles.title}>{room.name}</h1>
            <p className={styles.sub}>{room.devices.length} devices · {activeCount} active</p>
          </div>
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            ＋ Add Appliance
          </button>
        </div>
      </div>

      {room.devices.length === 0 ? (
        <div className={styles.empty}>
          <span style={{ fontSize: 48 }}>📦</span>
          <p>No devices yet. Add your first device!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {room.devices.map(d => (
            <DeviceCard key={d.id} roomId={roomId} device={d} />
          ))}
          <button className={styles.newDevice} onClick={() => setShowModal(true)}>
            <span style={{ fontSize: 24 }}>＋</span>
            <span>Add Device</span>
          </button>
        </div>
      )}

      {showModal && (
        <Modal title={`Add Appliance to ${room.name}`} onClose={() => setShowModal(false)}>
          <label>Appliance Name</label>
          <input
            value={devName}
            onChange={e => setDevName(e.target.value)}
            placeholder="e.g. Ceiling Light"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />

          <label style={{ display:'block', marginTop:14, marginBottom:6 }}>Device Number</label>
          <div style={{ display:'flex', alignItems:'center', gap:0, border:'1.5px solid rgba(0,0,0,0.1)', borderRadius:10, overflow:'hidden', background:'#fafafa' }}>
  <button
    type="button"
    onClick={() => setDevType(v => Math.max(0, v - 1))}
    style={{ width:44, height:44, fontSize:20, border:'none', background:'transparent', cursor:'pointer', color:'#555', fontWeight:700 }}
  >−</button>
  <input
    type="number"
    min="0"
    max="35"
    value={devType}
    onChange={e => {
      const val = e.target.value === '' ? 0 : Math.min(35, Math.max(0, Number(e.target.value)))
      setDevType(val)
    }}
    style={{
      flex:1, textAlign:'center', padding:'10px 0',
      border:'none', borderLeft:'1px solid rgba(0,0,0,0.08)', borderRight:'1px solid rgba(0,0,0,0.08)',
      fontSize:15, fontFamily:'inherit', outline:'none',
      background:'transparent', MozAppearance:'textfield'
    }}
  />
  <button
    type="button"
    onClick={() => setDevType(v => Math.min(35, v + 1))}
    style={{ width:44, height:44, fontSize:20, border:'none', background:'transparent', cursor:'pointer', color:'#555', fontWeight:700 }}
  >＋</button>
</div>
   <label style={{ display:'block', marginTop:14, marginBottom:6 }}>Device Name</label>
<select
  value={devConn}
  onChange={e => setDevConn(e.target.value)}
  style={{
    width:'100%', padding:'10px 14px',
    border:'1.5px solid rgba(0,0,0,0.1)',
    borderRadius:10, fontSize:14,
    fontFamily:'inherit', outline:'none',
    background:'#fafafa', cursor:'pointer'
  }}
>
  <option value="local">Local / no ESP32</option>
</select>

          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button
              style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'#f0f0f0',color:'#666',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'var(--accent)',color:'white',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}}
              onClick={handleAdd}
            >
              Add Device
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}