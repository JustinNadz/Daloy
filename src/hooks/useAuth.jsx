import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/services'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await authService.getMe()
      setUser(response.data.user)
    } catch (err) {
      console.error('Auth check failed:', err)
      localStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    setError(null)
    try {
      const response = await authService.login(credentials)
      localStorage.setItem('auth_token', response.data.token)
      setUser(response.data.user)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      throw err
    }
  }

  const register = async (data) => {
    setError(null)
    try {
      const response = await authService.register(data)
      localStorage.setItem('auth_token', response.data.token)
      setUser(response.data.user)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data)
      setUser(response.data.user)
      return response.data
    } catch (err) {
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
