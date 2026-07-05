import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './VerifyresetOTP.css'

export default function VerifyResetOTP() {

    const location = useLocation()
    const navigate = useNavigate()

    const email = location.state?.email || ''

    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const verifyOTP = async () => {

        if (!otp.trim()) {
            setError("Enter OTP")
            return
        }

        setLoading(true)
        setError("")

        try {

            const res = await fetch(
                'http://10.200.163.50:4000/api/auth/verify-reset-otp',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        otp
                    })
                }
            )

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                setLoading(false)
                return
            }

            navigate('/reset-password', {
                state: {
                    email
                }
            })

        }
        catch (err) {

            setError("Server Error")

        }

        setLoading(false)

    }

    return (

        <div className="forgot-page">

            <div className="forgot-card">

                <h1>ConHome</h1>

                <h2>Verify OTP</h2>

                <p>Enter the OTP sent to</p>

                <b>{email}</b>

                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e)=>setOtp(e.target.value)}
                />

                {error &&

                    <p className="error">
                        {error}
                    </p>

                }

                <button onClick={verifyOTP}>

                    {loading ? "Verifying..." : "Verify OTP"}

                </button>

            </div>

        </div>

    )

}