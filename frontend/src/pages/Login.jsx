import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { getBackendUrl } from '../utils/config'
import './Login.css'

const Login = () => {
  const [loading, setLoading] = useState(false)
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
        
        // Update auth context
        login(token, user)
        
        // Navigate to dashboard
        navigate(user.role === 'trainer' ? '/trainer' : '/trainee')
        
        // Clean up URL
        window.history.replaceState({}, '', '/')
      } catch (error) {
        console.error('Failed to parse OAuth callback:', error)
      }
    }
  }, [navigate, login])

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-section">
          <div className="logo">
            <img src="/cloud-extel-logo.png" alt="CloudExtel" />
          </div>
          <h1>CloudExtel</h1>
          <p className="subtitle">AI Literacy Training</p>
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

