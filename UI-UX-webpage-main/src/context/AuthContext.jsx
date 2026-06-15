import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const API = 'http://localhost:4000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smarthome_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Login failed' }
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.userId)
      const userData = { name: data.name, email, userId: data.userId }
      localStorage.setItem('smarthome_user', JSON.stringify(userData))
     setUser(userData)
window.location.href = '/stats'
return { success: true }
    } catch (err) {
      return { error: 'Server not reachable. Is backend running?' }
    }
  }

  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Registration failed' }
      return await login(email, password)
    } catch (err) {
      return { error: 'Server not reachable. Is backend running?' }
    }
  }

  const logout = () => {
    localStorage.removeItem('smarthome_user')
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }