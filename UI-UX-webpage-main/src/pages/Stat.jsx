import React, { useState, useRef, useEffect } from 'react'
import { useHome } from '../context/HomeContext'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import styles from './Stats.module.css'

const MONTHLY = [
  { month: 'Jan', kwh: 420 }, { month: 'Feb', kwh: 380 }, { month: 'Mar', kwh: 350 },
  { month: 'Apr', kwh: 310 }, { month: 'May', kwh: 340 }, { month: 'Jun', kwh: 410 },
  { month: 'Jul', kwh: 460 }, { month: 'Aug', kwh: 440 },
]

const BY_ROOM = [
  { room: 'Living', kwh: 120 }, { room: 'Bedroom', kwh: 85 },
  { room: 'Kitchen', kwh: 140 }, { room: 'Study', kwh: 60 },
]

const WEEKLY = [
  { day: 'Mon', kwh: 18 }, { day: 'Tue', kwh: 22 }, { day: 'Wed', kwh: 15 },
  { day: 'Thu', kwh: 28 }, { day: 'Fri', kwh: 32 }, { day: 'Sat', kwh: 24 }, { day: 'Sun', kwh: 19 },
]

const TOOLTIP_STYLE = {
  contentStyle: { background: 'rgba(255,255,255,0.97)', border: 'none', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
  labelStyle: { fontWeight: 700, color: '#333' },
}

export default function Stats() {
  const { totalDevices, activeDevices, rooms } = useHome()
  const [scanOpen, setScanOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const videoRef = useRef(null)
  const totalRooms = rooms.length
  useEffect(() => {
    if (scanOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
        })
        .catch(err => alert('Camera not accessible: ' + err.message))
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [scanOpen])

  const statCards = [
    { label: 'Total Devices', value: totalDevices, icon: '📱', color: '#e8724a' },
    { label: 'Active Now',    value: activeDevices, icon: '🟢', color: '#4caf88' },
    { label: 'Rooms',         value: totalRooms,    icon: '🚪', color: '#3ab5b0' },
    { label: 'Monthly kWh',   value: '440',         icon: '⚡', color: '#f5a623' },
  ]

  return (
    <div>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:24,fontWeight:600,color:'#1a1a2e'}}>Home</h1>
          <p style={{fontSize:14,color:'#7a7a9a'}}>Energy & device usage overview</p>
        </div>
        <button
  onClick={() => setScanOpen(true)}
  style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:12,border:'none',background:'#6f6a6a',color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}
>
  + Add Device
</button>
      </div>

      {/* QR Scanner Popup */}
      {scanOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'white',borderRadius:24,padding:36,width:360,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#6b7280',marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>Add Device</div>
            <h3 style={{fontSize:20,fontWeight:800,color:'#1a1a2e',marginBottom:8}}>Scan QR Code</h3>
            <p style={{fontSize:13,color:'#888',marginBottom:24,lineHeight:1.6}}>Point your camera at the QR code printed on your smart device to add it to your home</p>
            <div style={{width:260,margin:'0 auto 20px',borderRadius:16,overflow:'hidden',border:'3px solid #6b7280'}}>
              <video
                ref={videoRef}
                style={{width:'100%',height:260,objectFit:'cover',display:'block'}}
                autoPlay
                playsInline
                muted
              />
            </div>
            <p style={{fontSize:12,color:'#bbb',marginBottom:24}}>Make sure the QR code is well lit and fully visible</p>
            <button
              onClick={() => setScanOpen(false)}
              style={{width:'100%',padding:13,borderRadius:12,border:'none',background:'#f0f0f0',color:'#666',fontSize:14,fontWeight:700,cursor:'pointer'}}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className={styles.statCards}>
        {statCards.map(s => (
          <div key={s.label} className={`${styles.statCard} glass`}>
            <span className={styles.statIcon}>{s.icon}</span>
            <span className={styles.statVal} style={{ color: s.color }}>{s.value}</span>
            <span className={styles.statLbl}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={styles.charts}>

        {/* Monthly Trend — always visible */}
        <div className={`${styles.chartWide} glass`}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 className={styles.chartTitle} style={{marginBottom:0}}>Monthly Trend (kWh)</h3>
            <button
              onClick={() => setShowMore(s => !s)}
              style={{
                padding:'6px 14px', borderRadius:20,
               border:'1.5px solid rgba(107,114,128,0.3)',
background: showMore ? '#6b7280' : 'transparent',
color: showMore ? 'white' : '#6b7280',
                fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s'
              }}
            >
              {showMore ? 'Less ▲' : 'More ▼'}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MONTHLY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6b7280" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="kwh" stroke="#6b7280" strokeWidth={2.5} dot={{ r: 4, fill: "#6b7280", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly and By Room — only when More clicked */}
        {showMore && (
          <>
        
            <div className={`${styles.chart} glass`}>
              <h3 className={styles.chartTitle}>Weekly Consumption (kWh)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={WEEKLY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6b7280" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="kwh" stroke="#6b7280" strokeWidth={2.5} fill="url(#wk)" dot={{ r: 4, fill: '#6b7280', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className={`${styles.chart} glass`}>
              <h3 className={styles.chartTitle}>By Room (kWh this month)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={BY_ROOM} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" />
                  <XAxis dataKey="room" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="kwh" fill='#6b7280' radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
