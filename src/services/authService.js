import api from './api'

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data)
    return response
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
    }
  },

  async getMe() {
    const response = await api.get('/auth/me')
    return response
  },

  async updateProfile(data) {
    const response = await api.put('/auth/profile', data)
    return response
  },

  async updatePassword(currentPassword, password, passwordConfirmation) {
    return api.put('/auth/password', {
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    })
  },

  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async uploadCoverPhoto(file) {
    const formData = new FormData()
    formData.append('cover_photo', file)
    return api.post('/auth/cover-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  },
}

export default authService
