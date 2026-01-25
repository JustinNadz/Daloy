import api from './api'

export const messageService = {
  // Get all conversations
  async getConversations(page = 1) {
    return api.get('/messages/conversations', { params: { page } })
  },

  // Get messages in a conversation
  async getMessages(conversationId, page = 1, before = null) {
    const params = { page }
    if (before) params.before = before
    return api.get(`/messages/conversations/${conversationId}`, { params })
  },

  // Start a new direct conversation
  async startConversation(userId, message = null) {
    return api.post('/messages/conversations', {
      user_id: userId,
      message,
    })
  },

  // Create a group conversation
  async createGroup(userIds, name = null, message = null) {
    return api.post('/messages/conversations/group', {
      user_ids: userIds,
      name,
      message,
    })
  },

  // Send a message in a conversation
  async sendMessage(conversationId, content, mediaIds = []) {
    return api.post(`/messages/conversations/${conversationId}`, {
      content,
      media_ids: mediaIds,
    })
  },

  // Edit a message
  async editMessage(messageId, content) {
    return api.put(`/messages/${messageId}`, {
      content,
    })
  },

  // Delete a message
  async deleteMessage(messageId) {
    return api.delete(`/messages/${messageId}`)
  },

  // Leave a conversation
  async leaveConversation(conversationId) {
    return api.post(`/messages/conversations/${conversationId}/leave`)
  },

  // Toggle mute for a conversation
  async toggleMuteConversation(conversationId) {
    return api.post(`/messages/conversations/${conversationId}/mute`)
  },
}

export default messageService
