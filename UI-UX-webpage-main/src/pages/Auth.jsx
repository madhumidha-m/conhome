import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'
import { Home } from 'lucide-react'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup } = useAuth()
  const navigate = useNavigate()

const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')

  if (mode === 'signup') {
    if (!name.trim()) return setError('Please enter your name')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
  }

  if (!email.trim()) return setError('Please enter your email')
  if (!password) return setError('Please enter your password')

  setLoading(true)

  const result =
    mode === 'login'
      ? await login(email.trim(), password)
      : await signup(name.trim(), email.trim(), password)

  // Login failed
  if (result.error) {
    setError(result.error)
    setLoading(false)
    return
  }

  // Login success
  if (mode === 'login') {
    setLoading(false)
    return
  }

  // Signup success → Go to OTP page


  
  navigate('/verify-otp', {
    state: {
      email: email.trim()
    }
  })

  setLoading(false)
}
  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError('')
    setName(''); setEmail(''); setPassword(''); setConfirm('')
  }

  return (
    <div className={styles.page}>
      {/* Background overlay */}
      <div className={styles.overlay} />

      <div className={styles.card}>
        {/* Left panel */}
        <div className={styles.left}>
          <div className={styles.brand}>
  <span className={styles.brandIcon}>
    <Home size={20} color="white" />
  </span>
  <span className={styles.brandName}>ConHome</span>
</div>
          <h1 className={styles.tagline}>Your home,<br />in your hands.</h1>
          <p className={styles.tagSub}>Control every room, every device, every moment — from one simple dashboard.</p>
         <div className={styles.features}>
  <div className={styles.feat}>
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    Smart device control
  </div>
  <div className={styles.feat}>
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    Energy monitoring
  </div>
  <div className={styles.feat}>
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    Door & security
  </div>
  <div className={styles.feat}>
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    Family access
  </div>
</div>
        </div>

        {/* Right panel - form */}
        <div className={styles.right}>
          <h2 className={styles.formTitle}>
            {mode === 'login' ? 'Welcome back 👋' : 'Create account '}
          </h2>
          <p className={styles.formSub}>
            {mode === 'login'
              ? 'Sign in to access your smart home'
              : 'Set up your Conhome account'}
          </p>
            <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
            {mode === 'signup' && (
              <div className={styles.field}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus={mode === 'login'}
                 autoComplete="new-password"
              />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <input
                type="password"
                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                 autoComplete="new-password"
              />
              {mode === 'login' && (
  <div style={{ textAlign: 'right', marginTop: '8px' }}>
    <button
      type="button"
      onClick={() => navigate('/forgot-password')}
      style={{
        border: 'none',
        background: 'none',
        color: '#2563eb',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      Forgot Password?
    </button>
  </div>
)}
            </div>

            {mode === 'signup' && (
              <div className={styles.field}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
            )}

            {error && <div className={styles.error}>⚠️ {error}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading
                ? '...'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className={styles.switchRow}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button className={styles.switchBtn} onClick={switchMode}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
