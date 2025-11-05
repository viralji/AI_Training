import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    // Return a fallback context
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      loading: false,
      login: (token, userData) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
      },
      logout: () => {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('submission_')) {
            localStorage.removeItem(key)
          }
        })
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      },
      getAuthHeaders: () => {
        const token = localStorage.getItem('token')
        return {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      },
      API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api'
    }
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    // Clear all submission data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('submission_')) {
        localStorage.removeItem(key)
      }
    })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getAuthHeaders, API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api' }}>
      {children}
    </AuthContext.Provider>
  )
}

export default useAuth

