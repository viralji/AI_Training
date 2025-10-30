import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './hooks/useAuth.jsx'
import Login from './pages/Login'
import TrainerDashboard from './pages/TrainerDashboard'
import TraineeDashboard from './pages/TraineeDashboard'
import './index.css'
import VersionBadge from './components/VersionBadge'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(145deg, #090d11, #0a1015)',
        color: '#eaf2f9'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <VersionBadge />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/trainer" element={<Navigate to="/trainer/chapter-1" replace />} />
        <Route 
          path="/trainer/:chapterId" 
          element={
            user ? (user.role === 'trainer' ? <TrainerDashboard /> : <Navigate to="/trainee" />) : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/trainer/:chapterId/:slideId" 
          element={
            user ? (user.role === 'trainer' ? <TrainerDashboard /> : <Navigate to="/trainee" />) : <Navigate to="/login" />
          } 
        />
        <Route path="/trainee" element={<Navigate to="/trainee/chapter-1" replace />} />
        <Route 
          path="/trainee/:chapterId" 
          element={
            user ? (user.role === 'trainee' ? <TraineeDashboard /> : <Navigate to="/trainer" />) : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/trainee/:chapterId/:slideId" 
          element={
            user ? (user.role === 'trainee' ? <TraineeDashboard /> : <Navigate to="/trainer" />) : <Navigate to="/login" />
          } 
        />
        <Route path="/" element={<Navigate to={user ? (user.role === 'trainer' ? '/trainer' : '/trainee') : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App








