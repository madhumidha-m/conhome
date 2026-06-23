import React, { useState, useRef, useEffect } from 'react'
import { useHome } from '../context/HomeContext'
import jsQR from 'jsqr'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Cpu, Zap, DoorOpen, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
  const { totalDevices, activeDevices, rooms, homeName } = useHome()
  const [scanOpen, setScanOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [currentData, setCurrentData] = useState([])
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const totalRooms = rooms.length
  const [scannedDeviceId, setScannedDeviceId] = useState(null)
const [showEnrollModal, setShowEnrollModal] = useState(false)
const [selectedRoomId, setSelectedRoomId] = useState('')
const [showSetupModal, setShowSetupModal] = useState(false)
const [showSuccess, setShowSuccess] = useState(false)

  const [cameraError, setCameraError] = useState('')

useEffect(() => {
    if (scanOpen) {
      setCameraError('')
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera not supported. Make sure you are using HTTPS or localhost.')
        return
      }
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } } 
      })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
        })
        .catch(err => setCameraError('Camera not accessible: ' + err.message))
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [scanOpen])
  useEffect(() => {
  if (!scanOpen) return

  let animationId

  const scanFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        // QR code found!
        handleQRDetected(code.data)
        return // stop scanning
      }
    }
    animationId = requestAnimationFrame(scanFrame)
  }

  animationId = requestAnimationFrame(scanFrame)

  return () => {
    if (animationId) cancelAnimationFrame(animationId)
  }
}, [scanOpen])
const handleQRDetected = async (qrText) => {
  // Stop camera
  if (videoRef.current?.srcObject) {
    videoRef.current.srcObject.getTracks().forEach(t => t.stop())
  }
  setScanOpen(false)
  alert('QR Scanned: ' + qrText)

  // Validate with backend
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`http://10.175.136.50:4000/api/registry/validate/${qrText}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!data.valid) {
      alert(data.message)
      return
    }
    // Valid device — show room selection
   setScannedDeviceId(qrText.trim())
setShowSetupModal(true)
  } catch (err) {
    alert('Error connecting to server: ' + err.message)
  }
}

  useEffect(() => {
  fetch('http://10.175.136.50:4000/api/current')
    .then(res => res.json())
    .then(data => {
      const graphData = data.map(d => ({
        time: new Date(d.created_at).toLocaleTimeString(),
        current: d.current_value,
        power: d.power_value
      }))

      setCurrentData(graphData.reverse())
    })
    .catch(err => console.error(err))
}, [])

  const statCards = [
    { label: 'Total Devices', value: totalDevices, icon: Cpu,      color: '#ff4d4f' },
    { label: 'Active Now',    value: activeDevices, icon: Activity, color: '#4caf88' },
    { label: 'Rooms',         value: totalRooms,    icon: DoorOpen, color: '#3ab5b0' },
    { label: 'Monthly kWh',   value: '440',         icon: Zap,      color: '#ff4d4f' },
  ]

  return (
    <div>

      {/* Header */}
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
  <div>
    <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'clamp(16px, 4vw, 24px)',fontWeight:600,color:'var(--text-dark)'}}>{homeName || 'Home'}</h1>
    <p style={{fontSize:'clamp(11px, 2.5vw, 14px)',color:'var(--text-light)'}}>Energy & device usage overview</p>
  </div>
  <div style={{
  display:'flex',
  justifyContent:'flex-end',
  flexShrink:0
}}>
<button
  onClick={() => setScanOpen(true)}
  style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:12,border:'none',background:'#393a3b',color:'white',fontSize:'clamp(11px,2.5vw,13px)',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}
>
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  Add Device
</button>

</div>
      </div>
      {/* Enroll Modal */}
{/*showEnrollModal && (
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{background:'white',borderRadius:24,padding:36,width:360,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
      <h3 style={{fontSize:20,fontWeight:800,color:'#1a1a2e',marginBottom:8}}>Device Found! ✅</h3>
      <p style={{fontSize:13,color:'#888',marginBottom:8}}>Device ID: {scannedDeviceId}</p>
      <p style={{fontSize:14,fontWeight:700,color:'#333',marginBottom:12}}>Select Room for this ESP32:</p>
      <select
        value={selectedRoomId}
        onChange={e => setSelectedRoomId(e.target.value)}
        style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #ddd',fontSize:14,marginBottom:20,fontFamily:'inherit'}}
      >
        <option value="">-- Select Room --</option>
        {rooms.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
      <div style={{display:'flex',gap:10}}>
        <button
          onClick={() => setShowEnrollModal(false)}
          style={{flex:1,padding:13,borderRadius:12,border:'none',background:'#f0f0f0',color:'#666',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}}
        >Cancel</button>
        <button
          onClick={async () => {
            if (!selectedRoomId) { alert('Please select a room'); return }
            const token = localStorage.getItem('token')
            try {
              const res = await fetch('http://192.168.29.10:4000/api/enroll', {
                method: 'POST',
                headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
                body: JSON.stringify({ device_id: scannedDeviceId, room_id: selectedRoomId })
              })
              const data = await res.json()
              if (data.success) {
                alert('ESP32 enrolled successfully to room! ✅')
                setShowEnrollModal(false)
                setScannedDeviceId(null)
                setSelectedRoomId('')
              } else {
                alert('Error: ' + data.error)
              }
            } catch (err) {
              alert('Server error: ' + err.message)
            }
          }}
          style={{flex:1,padding:13,borderRadius:12,border:'none',background:'#6B7280',color:'white',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}}
        >Enroll Device</button>
      </div>
    </div>
  </div>
)
}*/}


    
      {showSetupModal && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(6px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <div
      style={{
        background: 'white',
        borderRadius: 24,
        padding: 30,
        width: 360,
        textAlign: 'left'
      }}
    >
      <h2 style={{ color: '#3b4140' }}>
        Add ESP32 Device
      </h2>

      <p><b>Step 1:</b> Power ON the ESP32.</p>

      <p>
        <b>Step 2:</b> Connect to WiFi:
        <br />
        <b>ESP32_SETUP</b>
      </p>

      <p>
        Password:
        <b> setup1234</b>
      </p>

      <p>
        <b>Step 3:</b> Open setup page and enter your WiFi credentials.
      </p>

      <button
        onClick={() => {
          window.open(
            'http://192.168.4.1',
            '_blank'
          )
        }}
        style={{
          width: '100%',
          padding: 12,
          marginTop: 10,
          border: 'none',
          borderRadius: 10,
          background: '#847f7c',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        Open Setup Page
      </button>

     <button
onClick={async () => {

  console.log("Device =", scannedDeviceId)

  try {

    const res = await fetch(
      'http://10.175.136.50:4000/api/enroll',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          device_id: scannedDeviceId,
          room_id: selectedRoomId
          
        })
      }
    )

  const data = await res.json()

  if (data.success) {

  setShowSuccess(true)
  setShowSetupModal(false)

} else {

  alert(data.error || "Enrollment Failed")

}

} catch (err) {

  alert("Enrollment Failed ❌")

}
}}

  style={{
    width:'100%',
    padding:12,
    marginTop:10,
    borderRadius:10
  }}
>
  I've Entered Credentials
</button>

      <button
        onClick={() => setShowSetupModal(false)}
        style={{
          width: '100%',
          padding: 12,
          marginTop: 10,
          borderRadius: 10
        }}
      >
        Close
      </button>
    </div>
  </div>
  
)}{showSuccess && (
  <div
    style={{
      position:'fixed',
      inset:0,
      background:'rgba(0,0,0,0.5)',
      zIndex:999,
      display:'flex',
      justifyContent:'center',
      alignItems:'center'
    }}
  >
    <div
      style={{
        background:'white',
        padding:'25px',
        borderRadius:'20px',
        width:'300px',
        textAlign:'center'
      }}
    >
      <h2>Success ✅</h2>

      <p>Device Enrolled Successfully</p>

      <button
        onClick={() => setShowSuccess(false)}
        style={{
          padding:'10px 20px',
          borderRadius:'10px',
          border:'none',
          background:'#847f7c',
          color:'white'
        }}
      >
        OK
      </button>
    </div>
  </div>
)}
{scanOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'white',borderRadius:24,padding:36,width:360,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#9ca3af',marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>Add Device</div>
            <h3 style={{fontSize:20,fontWeight:800,color:'#1a1a2e',marginBottom:8}}>Scan QR Code</h3>
            <p style={{fontSize:13,color:'#888',marginBottom:24,lineHeight:1.6}}>Point your camera at the QR code printed on your smart device to add it to your home</p>
            <div style={{width:'100%',margin:'0 auto 20px',borderRadius:16,overflow:'hidden',border:'3px solid #9ca3af'}}>
             <video
  ref={videoRef}
  style={{width:'100%',height:300,objectFit:'cover',display:'block'}}
  autoPlay
  playsInline
  muted
  webkit-playsinline="true"
/>
<canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            {cameraError && (
  <p style={{fontSize:13,color:'#dc3232',marginBottom:16,fontWeight:600}}>{cameraError}</p>
)}
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
         {/* Stat Cards — shown at bottom */}
      <div className={styles.statCards} style={{marginTop:20}}>
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`${styles.statCard} glass`}>
              <Icon size={28} color={s.color} />
              <span className={styles.statVal} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </div>
          )
        })}
      </div>

      {/* Charts — shown first */}
      <div className={styles.charts}>

        {/* Monthly Trend — always visible */}
        <div className={`${styles.chartWide} glass`}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 className={styles.chartTitle} style={{marginBottom:0}}>Monthly Trend (kWh)</h3>
            <button
              onClick={() => navigate('/graphs')}
              style={{
                padding:'6px 14px', borderRadius:20,
                border:'1.5px solid rgba(66, 64, 64, 0.3)',
                background: showMore ? '#2d6a4f' : 'transparent',
                color: showMore ? 'white' : '#9ca3af',
                fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s'
              }}
            >
              More →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={currentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4caf88" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4caf88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="power" stroke="#4caf88" strokeWidth={2.5} dot={{ r: 4, fill: '#4caf88', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>


      </div>

     

    </div>
  )
}
