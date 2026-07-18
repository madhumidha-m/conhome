import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Sidebar from './Sidebar'
import styles from './Layout.module.css'
import {
  LayoutDashboard, DoorOpen, Lightbulb,
  Users, Settings,Bot, Bell
} from 'lucide-react'

const BOTTOM_NAV = [
  { to: '/stats',        icon: LayoutDashboard, label: 'Home' },
  { to: '/rooms',   icon: DoorOpen,        label: 'Rooms' },
 { to: '/appliances', icon: Lightbulb, label: 'Appliances' },
  { to: '/automation',    icon: Bot,             label: 'Automation' },
  { to: '/members', icon: Users,           label: 'Members' },
   { to: '/notifications', icon: Bell,            label: 'Alerts' },
  { to: '/settings',icon: Settings,        label: 'Settings' },
]

export default function Layout() {
  const [navVisible, setNavVisible] = useState(true)

  return (
    <div
      className={styles.shell}
      onClick={() => setNavVisible(v => !v)}
    >
      {/* Desktop sidebar */}
      <div className={styles.desktopSidebar}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className={`${styles.bottomNav} ${navVisible ? styles.bottomVisible : styles.bottomHidden}`}>
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
       <NavLink
  key={to}
  to={to}
  onClick={e => e.stopPropagation()}
  className={({ isActive }) =>
    `${styles.bottomItem} ${isActive ? styles.bottomActive : ''}`
  }
>
  <span className={styles.bottomIcon}>
    <Icon size={22} />
  </span>
  <span className={styles.bottomLabel}>{label}</span>
</NavLink>
        ))}
      </nav>
    </div>
  )
}