import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Authcommon.css'
import { API } from "../config";

export default function Forgotpassword() {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sendOTP = async () => {

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    setLoading(true)
    setError("")
    try {

 const res = await fetch(
  `${API}/auth/forgot-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    }
  )

  const data = await res.json()

  if (!res.ok) {
    setError(data.error)
    setLoading(false)
    return
  }

  navigate('/verify-reset-otp', {
    state: { email }
  })

} catch (err) {

  setError('Server Error')

}

setLoading(false)

    // Backend will be connected in the next step

    setLoading(false)

  }

  return (

    <div className="forgot-page">

      <div className="forgot-card">

        <h1>ConHome</h1>

        <h2>Forgot Password</h2>

        <p>
          Enter your registered email address.
        </p>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        {error &&

          <p className="error">
            {error}
          </p>

        }

        <button
          onClick={sendOTP}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <button
          className="back"
          onClick={()=>navigate('/login')}
        >
          Back to Login
        </button>

      </div>

    </div>

  )

}