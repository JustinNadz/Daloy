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
    console.log('[Auth] Checking authentication...')
    const token = localStorage.getItem('auth_token')
    console.log('[Auth] Token found:', !!token)

    if (!token) {
      console.log('[Auth] No token, setting loading to false')
      setLoading(false)
      return
    }

    try {
      console.log('[Auth] Calling /auth/me endpoint...')
      const response = await authService.getMe()
      console.log('[Auth] Auth check successful, user:', response.data.data.user)
      setUser(response.data.data.user)
    } catch (err) {
      console.error('[Auth] Auth check failed:', err)
      console.error('[Auth] Error response:', err.response)
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      console.log('[Auth] Setting loading to false')
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    setError(null)
    try {
      console.log('[Auth] Logging in...')
      const response = await authService.login(credentials)
      console.log('[Auth] Login successful, saving token and user')
      console.log('[Auth] Full response:', response.data)
      localStorage.setItem('auth_token', response.data.data.token)
      setUser(response.data.data.user)
      console.log('[Auth] User set:', response.data.data.user)
      return response.data.data
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
      localStorage.setItem('auth_token', response.data.data.token)
      setUser(response.data.data.user)
      return response.data.data
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
      setUser(response.data.data.user)
      return response.data.data
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
