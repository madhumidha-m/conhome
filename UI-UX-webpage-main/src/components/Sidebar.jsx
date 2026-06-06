import React from 'react'
import { NavLink } from 'react-router-dom'
import { useHome } from '../context/HomeContext'
import styles from './Sidebar.module.css'
import {
  LayoutDashboard, DoorOpen, Lightbulb,
  Users, Bell, Settings, BarChart2, X
} from 'lucide-react'

const NAV = [
  { to: '/',              icon: LayoutDashboard, label: 'Home' },
  { to: '/rooms',         icon: DoorOpen,        label: 'Rooms' },
  { to: '/devices',       icon: Lightbulb,       label: 'Appliances' },
  { to: '/members',       icon: Users,           label: 'Members' },
  { to: '/notifications', icon: Bell,            label: 'Alerts' },
  { to: '/settings',      icon: Settings,        label: 'Settings' },
]

export default function Sidebar({ open, onClose }) {
  const { notifications } = useHome()
  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
      <div className={styles.brand}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>
        <img src="/logo.jpg" alt="Logo" className={styles.logoImage} />
        <span className={styles.brandName}>SmartNest</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <Icon size={18} className={styles.icon} />
            <span className={styles.label}>{label}</span>
            {to === '/notifications' && notifications.length > 0 && (
              <span className={styles.badge}>{notifications.length}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.userCard}>
          <span className={styles.avatar}>👤</span>
          <div>
            <div className={styles.userName}>Admin</div>
            <div className={styles.userRole}>Owner</div>
          </div>
        </div>
      </div>
    </aside>
  )
}