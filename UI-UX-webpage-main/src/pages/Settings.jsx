import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import styles from './Settings.module.css'
import { useHome } from '../context/HomeContext'
import { AlignCenter, Home } from 'lucide-react'



export default function Settings() {
  const { homeName, setHomeName } = useHome()
  const [notifications, setNotifications] = useState(true)
  const [autoLock, setAutoLock] = useState(true)
  const [energySave, setEnergySave] = useState(false)

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your home preferences" />

      <div className={styles.sections}>
        <div className={`${styles.section} glass`}>
          <h3 className={styles.sectionTitle}><Home size={18} style={{verticalAlign:'middle', marginRight:8}} />Home Settings</h3>
          <div className={styles.row}>
            <label className={styles.label}>Home Name</label>
            <input
  className={styles.input}
  defaultValue={homeName}
  onKeyDown={e => {
    if (e.key === 'Enter') {
      setHomeName(e.target.value)
      e.target.blur()
    }
  }}
/>
          </div>
        </div>

        <div className={`${styles.section} glass`}>
          <h3 className={styles.sectionTitle}>🔔 Preferences</h3>
          {[
            { label: 'Push Notifications', sub: 'Get alerts for door, devices and more', val: notifications, set: setNotifications },
            { label: 'Auto Lock at 11 PM', sub: 'Automatically lock front door at night', val: autoLock, set: setAutoLock },
            { label: 'Energy Saving Mode', sub: 'Turn off idle devices after 30 min', val: energySave, set: setEnergySave },
          ].map(item => (
            <div key={item.label} className={styles.toggleRow}>
              <div>
                <div className={styles.toggleLabel}>{item.label}</div>
                <div className={styles.toggleSub}>{item.sub}</div>
              </div>
              <button
                className={`${styles.toggle} ${item.val ? styles.toggleOn : ''}`}
                onClick={() => item.set(v => !v)}
              >
                <span className={styles.knob} />
              </button>
            </div>
          ))}
        </div>

      
      </div>
     
    <div style={{
  marginTop:'24px',
  display:'flex',
  justifyContent:'flex-start'
}}>
  <span
onClick={() => {
  if(window.confirm('Are you sure you want to logout?')) {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/login'
  }
}}
    style={{
      color:'#ef4444',
      fontSize:'16px',
      fontWeight:'700',
      cursor:'pointer',
      
    }}
  >
    Logout
  </span>
</div>
    </div>
  )
}
