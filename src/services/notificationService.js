import api from './api'

export const notificationService = {
  // Get paginated notifications
  async getNotifications(page = 1, type = null) {
    const params = { page }
    if (type) params.type = type
    return api.get('/notifications', { params })
  },

  // Get unread notification count
  async getUnreadCount() {
    return api.get('/notifications/unread-count')
  },

  // Mark a single notification as read
  async markAsRead(notificationId) {
    return api.post(`/notifications/${notificationId}/read`)
  },

  // Mark all notifications as read
  async markAllAsRead() {
    return api.post('/notifications/read-all')
  },

  // Delete a single notification
  async deleteNotification(notificationId) {
    return api.delete(`/notifications/${notificationId}`)
  },

  // Clear all notifications
  async clearAll() {
    return api.delete('/notifications')
  },
}

export default notificationService
