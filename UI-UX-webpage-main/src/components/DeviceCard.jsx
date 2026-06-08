import React, { useState } from 'react'
import { useHome } from '../context/HomeContext'
import Modal from './Modal'
import styles from './DeviceCard.module.css'
import { Pencil } from 'lucide-react'

const TYPE_COLORS = {
  light:    { bg: '#fffbea', accent: '#f5a623' },
  ac:       { bg: '#eaf6ff', accent: '#3ab5b0' },
  tv:       { bg: '#eef4ff', accent: '#5b7ff5' },
  fan:      { bg: '#eafff6', accent: '#4caf88' },
  purifier: { bg: '#f0eaff', accent: '#9b7fe8' },
  speaker:  { bg: '#fff0ea', accent: '#e8724a' },
  lock:     { bg: '#fff5ea', accent: '#e8a042' },
  camera:   { bg: '#eafff0', accent: '#3bb87a' },
  vacuum:   { bg: '#eaf3ff', accent: '#5b9ef5' },
  wifi:     { bg: '#eafff8', accent: '#2ec9a0' },
  other:    { bg: '#f5f5f5', accent: '#888' },
}

const TYPE_EMOJI = {
  light: '💡', ac: '❄️', tv: '📺', fan: '🌀', purifier: '🌬️',
  speaker: '🔊', lock: '🔒', camera: '📷', vacuum: '🤖', wifi: '📶', other: '🔌',
}

export default function DeviceCard({ roomId, device }) {
  const { toggleDevice, removeDevice, renameDevice } = useHome()
  const colors = TYPE_COLORS[device.type] || TYPE_COLORS.other
  const emoji = TYPE_EMOJI[device.type] || '🔌'

  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState(device.name)

  const handleSave = () => {
    if (!editName.trim()) return
    renameDevice(roomId, device.id, editName.trim())
    setShowEdit(false)
  }

  const handleDelete = () => {
    removeDevice(roomId, device.id)
    setShowEdit(false)
  }

  return (
    <>
      <div
        className={styles.card}
        style={{ background: device.on ? colors.bg : '#f9f9f9' }}
      >
        <div className={styles.topRow}>
          <span
            className={styles.iconWrap}
            style={{ background: device.on ? colors.accent + '22' : '#eee' }}
          >
            <span style={{ fontSize: 22 }}>{emoji}</span>
          </span>
          <button
            className={`${styles.toggle} ${device.on ? styles.on : ''}`}
            style={device.on ? { background: colors.accent } : {}}
            onClick={() => toggleDevice(roomId, device.id)}
            aria-label="Toggle"
          >
            <span className={styles.knob} />
          </button>
        </div>
        <div className={styles.name}>{device.name}</div>
        <div className={styles.status} style={{ color: device.on ? colors.accent : '#aaa' }}>
          {device.on ? 'Active' : 'Off'}
        </div>

        {/* Edit button — replaces the old ✕ */}
       <button
  className={styles.editBtn}
  onClick={() => { setEditName(device.name); setShowEdit(true) }}
  title="Edit device"
>
  <Pencil size={15} />
</button>
      </div>

      {/* Edit popup */}
      {showEdit && (
        <Modal title="Edit Appliance" onClose={() => setShowEdit(false)}>
          <label>Appliance Name</label>
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            placeholder="e.g. Ceiling Light"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              onClick={handleDelete}
              style={{
                flex: 1, padding: '11px', borderRadius: 10, border: 'none',
                background: 'light gray', color: 'var(--accent)', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 700
              }}
            >
              🗑 Delete
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1, padding: '11px', borderRadius: 10, border: 'none',
                background: 'var(--accent)', color: 'white', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 700
              }}
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}