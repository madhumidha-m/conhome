
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomeProvider } from './context/HomeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import Appliances from './pages/Appliances'
import Stats from './pages/Stats'
import Members from './pages/Members'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import Graphs from './pages/Graphs'
import VerifyOTP from './pages/VerifyOTP'
import Forgotpassword from './pages/Forgotpassword'
import VerifyresetOTP from './pages/VerifyresetOTP'
import ResetPassword from './pages/ResetPassword'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/forgot-password" element={<Forgotpassword />} />
      <Route path="/verify-reset-otp"element={<VerifyresetOTP />}/>
      <Route path="/reset-password"element={<ResetPassword />}/>
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
       <Route path="dashboard" element={<Stats />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/:roomId" element={<RoomDetail />} />
        <Route path="appliances" element={<Appliances />} />
        <Route path="stats" element={<Stats />} />
        <Route path="members" element={<Members />} />
        <Route path="settings" element={<Settings />} />
        <Route path="graphs" element={<Graphs />} />
        <Route path="notifications" element={<Notifications />} />
       
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HomeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </HomeProvider>
    </AuthProvider>
  )
}
