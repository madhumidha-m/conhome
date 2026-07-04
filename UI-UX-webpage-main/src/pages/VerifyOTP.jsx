import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './VerifyOTP.css'

export default function VerifyOTP() {

    const location = useLocation()
    const navigate = useNavigate()

    const email = location.state?.email || ''

    const [otp,setOtp]=useState('')
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState('')
    const [seconds, setSeconds] = useState(60)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [seconds])

    const verifyOTP = async()=>{

        setLoading(true)
        setError('')

        try{

            const res = await fetch(
                'http://10.200.163.50:4000/api/auth/verify-otp',
                {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({
                        email,
                        otp
                    })
                }
            )

            const data = await res.json()

            if(!res.ok){
                setError(data.error)
                setLoading(false)
                return
            }

          localStorage.setItem('token', data.token)
localStorage.setItem('userId', data.userId)

localStorage.setItem(
  'smarthome_user',
  JSON.stringify({
    name: data.name,
    email: data.email,
    userId: data.userId
  })
)

navigate('/dashboard')
        }
        catch(err){
            setError("Server Error")
        }

        setLoading(false)
    }
    const resendOTP = async () => {

  try {

    const res = await fetch(
      'http://10.200.163.50:4000/api/auth/resend-otp',
      {
        method: 'POST',
        headers: {
          'Content-Type':'application/json'
        },
        body: JSON.stringify({ email })
      }
    )

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      return
    }

    alert("New OTP sent successfully ")

    setSeconds(60)

  } catch(err) {

    setError("Unable to resend OTP")

  }

}

    return(

        <div className="otp-page">

            <div className="otp-card">

                <div className="logo">
                    ConHome
                </div>

                <h2 className="title">
                    Verify Your Email
                </h2>

                <p className="subtitle">
                    We've sent a verification code to
                </p>

                <div className="email">
                    {email}
                </div>

                <input
                    className="input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e)=>setOtp(e.target.value)}
                />

                {error &&

                    <div className="error">
                        {error}
                    </div>

                }

                <button
                    className="verify-btn"
                    onClick={verifyOTP}
                >

                    {loading ? "Verifying..." : "Verify OTP"}

                </button>

                <div className="info">

                    <p>✓ Check your Spam/Junk folder</p>

                    

                    <p>✓ Make sure your email address is correct</p>

                </div>

                <button
                    className="change-email"
                    onClick={()=>navigate('/login')}
                >
                    Change Email
                </button>
<div style={{ marginTop: "15px", textAlign: "center" }}>

  {seconds > 0 ? (

    <span>
      Resend OTP in {seconds}s
    </span>

  ) : (

    <button
      onClick={resendOTP}
      style={{
        border: "none",
        background: "none",
        color: "#2563eb",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px"
      }}
    >
      Resend OTP
    </button>

  )}

</div>

            </div>

        </div>

    )

}
