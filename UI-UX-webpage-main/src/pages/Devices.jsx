import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHome } from '../context/HomeContext'
import DeviceCard from '../components/DeviceCard'
import PageHeader from '../components/PageHeader'
import styles from './Devices.module.css'
import { LayoutGrid, Zap, Power } from 'lucide-react'

export default function Devices() {
  const { rooms, totalDevices, activeDevices } = useHome()
  const [filter, setFilter] = useState('all')

  const allDevicesWithRoom = rooms.flatMap(r => r.devices.map(d => ({ ...d, roomId: r.id, roomName: r.name })))
  const filtered = filter === 'all' ? allDevicesWithRoom
    : filter === 'on' ? allDevicesWithRoom.filter(d => d.on)
    : allDevicesWithRoom.filter(d => !d.on)

  return (
    <div>
      <PageHeader
        title="All Devices"
        subtitle={`${activeDevices} active of ${totalDevices} total`}
        action={
          <div className={styles.filterRow}>
        
{['all','on','off'].map(f => (

  <button
    key={f}
    className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
    onClick={() => setFilter(f)}
  >

    {
      f === 'all' ? (
        <>
          <LayoutGrid size={18} />
          <span>All</span>
        </>
      ) : f === 'on' ? (
        <>
          <Zap size={18} />
          <span>Active</span>
        </>
      ) : (
        <>
          <Power size={18} />
          <span>Off</span>
        </>
      )
    }

  </button>

))}

          </div>
        }
      />

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
          <p>No devices found. <Link to="/rooms">Add devices via Rooms.</Link></p>
        </div>
      ) : (
        <div className={styles.sections}>
          {rooms.filter(r => {
            const devs = r.devices.filter(d =>
              filter === 'all' ? true : filter === 'on' ? d.on : !d.on
            )
            return devs.length > 0
          }).map(r => {
            const devs = r.devices.filter(d =>
              filter === 'all' ? true : filter === 'on' ? d.on : !d.on
            )
            return (
              <div key={r.id} className={styles.section}>
                <div className={styles.roomHead}>
                  <span>{r.icon}</span>
                  <span className={styles.roomLabel}>{r.name}</span>
                  <Link to={`/rooms/${r.id}`} className={styles.manageLink}>Manage →</Link>
                </div>
                <div className={styles.grid}>
                  {devs.map(d => (
                    <DeviceCard key={d.id} roomId={r.id} device={d} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
