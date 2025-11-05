import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { getBackendUrl } from '../utils/config'
import './Login.css'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = `${getBackendUrl()}/auth/google`
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed. Please try again.')
      setLoading(false)
    }
  }

  // Load version on mount from backend single source
  useEffect(() => {
    const api = getBackendUrl()
    fetch(`${api}/api/version`)
      .then(res => res.ok ? res.json() : { version: '' })
      .then(data => setVersion((data.version || '').trim()))
      .catch(() => setVersion(''))
  }, [])

  // Handle OAuth callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userParam = params.get('user')
    
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        
        // Store in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Update auth context first
        login(token, user)
        
        // Navigate to dashboard immediately
        const redirectPath = user.role === 'trainer' ? '/trainer/chapter-1' : '/trainee/chapter-1'
        navigate(redirectPath, { replace: true })
        
        // Clean up URL
        window.history.replaceState({}, '', redirectPath)
      } catch (error) {
        console.error('Failed to parse OAuth callback:', error)
        setLoading(false)
      }
    } else {
      // Check if user is already logged in
      const existingToken = localStorage.getItem('token')
      const existingUser = localStorage.getItem('user')
      if (existingToken && existingUser) {
        try {
          const user = JSON.parse(existingUser)
          const redirectPath = user.role === 'trainer' ? '/trainer/chapter-1' : '/trainee/chapter-1'
          navigate(redirectPath, { replace: true })
        } catch (error) {
          console.error('Failed to parse existing user:', error)
        }
      }
    }
  }, [navigate, login])

  return (
    <div className="login-container">
      {version && (
        <div className="version-badge">v{version}</div>
      )}
      <div className="login-card">
        <div className="brand-section">
          <h1>AI Literacy Training</h1>
          <p className="subtitle">Empowering teams with AI skills</p>
        </div>
        
        <div className="login-content">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to your training session</p>
          
          <button 
            className="google-btn" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
          
          <p className="note">
            Authentication powered by Google OAuth
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

