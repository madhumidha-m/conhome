import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { ArrowLeft } from 'lucide-react'
import styles from './Stats.module.css'

const TOOLTIP_STYLE = {
  contentStyle: { background: 'rgba(255,255,255,0.97)', border: 'none', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
  labelStyle: { fontWeight: 700, color: '#333' },
}

const ALL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const ALL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function Graphs() {
  const navigate = useNavigate()
  const [monthlyData, setMonthlyData] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [recentData, setRecentData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    const token = localStorage.getItem('token')
    fetch('/api/current', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return

        // Recent live data
        let recent = [...data].slice(0, 50).reverse().map(d => ({
          time: new Date(d.created_at).toLocaleTimeString(),
          power: parseFloat(parseFloat(d.power || 0).toFixed(2)),
          current: parseFloat(parseFloat(d.current || 0).toFixed(3)),
        }))

        // Check if device went offline (no reading in last 15 seconds)
        if (data.length > 0) {
          const lastReadingTime = new Date(data[0].created_at).getTime()
          const now = Date.now()
          const secondsSinceLastReading = (now - lastReadingTime) / 1000

          if (secondsSinceLastReading > 15) {
            recent.push({
              time: new Date().toLocaleTimeString(),
              power: 0,
              current: 0,
            })
          }
        }

        setRecentData(recent)

        // Monthly - show all 12 months
        const monthMap = {}
        ALL_MONTHS.forEach(m => monthMap[m] = 0)
        data.forEach(d => {
          const month = ALL_MONTHS[new Date(d.created_at).getMonth()]
          monthMap[month] += parseFloat(d.energy_kwh || 0)
        })
        setMonthlyData(ALL_MONTHS.map(month => ({
          month,
          kwh: parseFloat(monthMap[month].toFixed(4))
        })))

        // Weekly - show all 7 days
        const dayMap = {}
        ALL_DAYS.forEach(d => dayMap[d] = 0)
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        data.forEach(d => {
          const day = dayNames[new Date(d.created_at).getDay()]
          if (dayMap[day] !== undefined) dayMap[day] += parseFloat(d.energy_kwh || 0)
        })
        setWeeklyData(ALL_DAYS.map(day => ({
          day,
          kwh: parseFloat(dayMap[day].toFixed(4))
        })))

        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:24}}>
        <button
          onClick={() => navigate(-1)}
          style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:10,border:'1.5px solid #e0e0e0',background:'#f5f5f5',color:'#555',fontSize:14,fontWeight:700,cursor:'pointer'}}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:22,fontWeight:600,color:'#1a1a2e'}}>All Graphs</h1>
          <p style={{fontSize:13,color:'#7a7a9a'}}>Detailed energy consumption</p>
        </div>
      </div>

      {loading ? (
        <p style={{textAlign:'center',color:'#aaa',marginTop:40}}>Loading data...</p>
      ) : (
        <div className={styles.charts}>

          {/* Live Power */}
          <div className={`${styles.chartWide} glass`}>
            <h3 className={styles.chartTitle}>Live Power (W)</h3>
            {recentData.length === 0 ? (
              <p style={{textAlign:'center',color:'#aaa',padding:40}}>No live data yet. Connect your ESP32!</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={recentData} margin={{top:5,right:10,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="time" tick={{fontSize:11,fill:'#aaa'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:11,fill:'#aaa'}} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="power" stroke="#4caf88" strokeWidth={2.5} dot={{r:3,fill:'#4caf88',strokeWidth:0}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly */}
          <div className={`${styles.chartWide} glass`}>
            <h3 className={styles.chartTitle}>Monthly Trend (kWh)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{top:5,right:10,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" tick={{fontSize:11,fill:'#aaa'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:'#aaa'}} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="kwh" stroke="#4caf88" strokeWidth={2.5} dot={{r:4,fill:'#4caf88',strokeWidth:0}} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly */}
          <div className={`${styles.chartWide} glass`}>
            <h3 className={styles.chartTitle}>Weekly Consumption (kWh)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData} margin={{top:5,right:10,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="wk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8724a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e8724a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" tick={{fontSize:11,fill:'#aaa'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:'#aaa'}} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="kwh" stroke="#e8724a" strokeWidth={2.5} fill="url(#wk)" dot={{r:4,fill:'#e8724a',strokeWidth:0}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  )
}
