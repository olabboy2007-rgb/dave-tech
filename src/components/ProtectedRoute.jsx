import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-bg-base flex items-center justify-center text-white">Loading...</div>
  }

  return session ? <Outlet /> : <Navigate to="/signup" replace />
}