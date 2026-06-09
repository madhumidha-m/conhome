import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHome } from '../context/HomeContext'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import styles from './Rooms.module.css'
import {
  Sofa, BedDouble, ChefHat, Droplets, BookOpen,
  Dumbbell, Gamepad2, Leaf, Waves, Monitor, Car, Wind, Plus
} from 'lucide-react'

const ROOM_ICONS = [
  { id: 'sofa',    icon: Sofa,      label: 'Living Room' },
  { id: 'bed',     icon: BedDouble, label: 'Bedroom' },
  { id: 'kitchen', icon: ChefHat,   label: 'Kitchen' },
  { id: 'shower',  icon: Droplets,  label: 'Bathroom' },
  { id: 'study',   icon: BookOpen,  label: 'Study' },
  { id: 'gym',     icon: Dumbbell,  label: 'Gym' },
  { id: 'game',    icon: Gamepad2,  label: 'Game Room' },
  { id: 'garden',  icon: Leaf,      label: 'Garden' },
  { id: 'bath',    icon: Waves,     label: 'Bathtub' },
  { id: 'office',  icon: Monitor,   label: 'Office' },
  { id: 'garage',  icon: Car,       label: 'Garage' },
  { id: 'laundry', icon: Wind,      label: 'Laundry' },
]

const DEVICE_EMOJIS = {
  light:'💡', ac:'❄️', tv:'📺', fan:'🌀', purifier:'🌬️',
  speaker:'🔊', lock:'🔒', camera:'📷', vacuum:'🤖', wifi:'📶', other:'🔌'
}

function RoomIcon({ iconId, size = 36 }) {
  const found = ROOM_ICONS.find(ri => ri.id === iconId)
  if (found) {
    const Icon = found.icon
    return <Icon size={size} color="#2d6a4f" />
  }
  return <span style={{ fontSize: size }}>{iconId}</span>
}

function IconGrid({ selected, onSelect }) {
  return (
    <div className={styles.iconGrid}>
      {ROOM_ICONS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`${styles.iconBtn} ${selected === id ? styles.iconSelected : ''}`}
          onClick={() => onSelect(id)}
          title={label}
          type="button"
        >
          <Icon size={20} color={selected === id ? '#2d6a4f' : '#6b7280'} />
          <span style={{ fontSize: 9, marginTop: 3, color: selected === id ? '#2d6a4f' : '#888' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default function Rooms() {
  const { rooms, addRoom, removeRoom, editRoom } = useHome()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('sofa')
  const [editingRoom, setEditingRoom] = useState(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('sofa')

  const handleAdd = () => {
    if (!name.trim()) return
    addRoom(name.trim(), icon)
    setName('')
    setIcon('sofa')
    setShowModal(false)
  }

  const handleEdit = () => {
    if (!editName.trim()) return
    editRoom(editingRoom.id, editName.trim(), editIcon)
    setEditingRoom(null)
  }

  const handleDelete = () => {
    removeRoom(editingRoom.id)
    setEditingRoom(null)
  }

  return (
    <div>
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} room${rooms.length !== 1 ? 's' : ''} in your home`}
        action={
         <button
  onClick={() => setShowModal(true)}
 style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:12,border:'none',background:'#393a3b',color:'white',fontSize:'clamp(11px,2.5vw,13px)',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}
>
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  Add Room
</button>
        }
      />

      <div className={styles.grid}>
        {rooms.map(r => {
          const active = r.devices.filter(d => d.on).length
          return (
            <Link key={r.id} to={`/rooms/${r.id}`} className={`${styles.card} glass`}>
              {/* Only edit button — no ✕ */}
              <button
                className={styles.editRoom}
                onClick={e => {
                  e.preventDefault()
                  setEditingRoom(r)
                  setEditName(r.name)
                  setEditIcon(r.icon || 'sofa')
                }}
                title="Edit room"
              >✎</button>

              <div className={styles.roomIcon}>
                <RoomIcon iconId={r.icon} size={36} />
              </div>
              <h3 className={styles.roomName}>{r.name}</h3>
              <p className={styles.roomSub}>
                {r.devices.length} device{r.devices.length !== 1 ? 's' : ''}
              </p>
              <div className={styles.statusRow}>
                <span className={active > 0 ? 'tag tag-green' : 'tag tag-amber'}>
                  {active > 0 ? `${active} active` : 'All off'}
                </span>
              </div>
              <div className={styles.deviceIcons}>
                {r.devices.slice(0, 4).map(d => (
                  <span key={d.id} style={{ opacity: d.on ? 1 : 0.3, fontSize: 18 }}>
                    {DEVICE_EMOJIS[d.type] || '🔌'}
                  </span>
                ))}
                {r.devices.length > 4 && (
                  <span className={styles.more}>+{r.devices.length - 4}</span>
                )}
              </div>
            </Link>
          )
        })}

        <button className={styles.newCard} onClick={() => setShowModal(true)}>
          <Plus size={28} color="#2d6a4f" />
          <span className={styles.newLabel}>New Room</span>
        </button>
      </div>

      {/* Edit Room Modal */}
      {editingRoom && (
        <Modal title="Edit Room" onClose={() => setEditingRoom(null)}>
          <label>Room Name</label>
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleEdit()}
          />
          <label style={{ marginTop: 14 }}>Room Type</label>
          <IconGrid selected={editIcon} onSelect={setEditIcon} />
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
  onClick={handleDelete}
  style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:'#f0f0f0', color:'#666', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700 }}
>
  Delete
</button>
            <button
              style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:'#6B7280', color:'white', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700 }}
              onClick={handleEdit}
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Add Room Modal */}
      {showModal && (
        <Modal title="Add New Room" onClose={() => setShowModal(false)}>
          <label>Room Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Master Bedroom"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <label style={{ marginTop: 14 }}>Room Type</label>
          <IconGrid selected={icon} onSelect={setIcon} />
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:'#f0f0f0', color:'#666', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700 }}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:'#666', color:'white', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700 }}
              onClick={handleAdd}
            >
              Add Room
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}