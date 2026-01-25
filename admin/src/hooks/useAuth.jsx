import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin')
    const token = localStorage.getItem('admin_token')
    
    if (storedAdmin && token) {
      setAdmin(JSON.parse(storedAdmin))
      // Verify token is still valid
      api.get('/me')
        .then((res) => {
          setAdmin(res.data.data.admin)
          localStorage.setItem('admin', JSON.stringify(res.data.data.admin))
        })
        .catch(() => {
          localStorage.removeItem('admin')
          localStorage.removeItem('admin_token')
          setAdmin(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password })
    const { admin: adminData, token } = res.data.data
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin', JSON.stringify(adminData))
    setAdmin(adminData)
    return adminData
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch (e) {
      // Ignore errors
    }
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
