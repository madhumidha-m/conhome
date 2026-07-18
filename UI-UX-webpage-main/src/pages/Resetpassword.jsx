import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Authcommon.css'
import { API } from "../config";

export default function Resetpassword() {

  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetPassword = async () => {

    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {

      const res = await fetch(
        `${API}/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      alert("Password changed successfully ✅")

      navigate('/login')

    } catch (err) {

      setError("Server Error")

    }

    setLoading(false)

  }

  return (

    <div className="forgot-page">

      <div className="forgot-card">

        <h1>ConHome</h1>

        <h2>Reset Password</h2>

        <p>{email}</p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={resetPassword}>
          {loading ? "Updating..." : "Reset Password"}
        </button>

      </div>

    </div>

  )

}