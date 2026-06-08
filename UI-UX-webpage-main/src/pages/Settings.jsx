import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import styles from './Settings.module.css'
import { useHome } from '../context/HomeContext'

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
          <h3 className={styles.sectionTitle}>🏠 Home Settings</h3>
          <div className={styles.row}>
            <label className={styles.label}>Home Name</label>
            <input
              className={styles.input}
              value={homeName}
              onChange={e => setHomeName(e.target.value)}
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

        <div className={`${styles.section} glass`}>
          <h3 className={styles.sectionTitle}>🖼️ Background Image</h3>
          <p className={styles.bgNote}>
            Place your blurred interior photo as <code>bg.jpg</code> inside the <code>/public</code> folder of this project.
            The app will use it automatically as the background.
          </p>
        </div>
      </div>
    </div>
  )
}
