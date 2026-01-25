import api from './api'

export const userService = {
  async getUser(username) {
    return api.get(`/users/${username}`)
  },

  async getFollowers(username, page = 1) {
    return api.get(`/users/${username}/followers`, { params: { page } })
  },

  async getFollowing(username, page = 1) {
    return api.get(`/users/${username}/following`, { params: { page } })
  },

  async followUser(userId) {
    return api.post(`/users/${userId}/follow`)
  },

  async unfollowUser(userId) {
    return api.delete(`/users/${userId}/follow`)
  },

  async acceptFollowRequest(userId) {
    return api.post(`/users/${userId}/follow/accept`)
  },

  async rejectFollowRequest(userId) {
    return api.post(`/users/${userId}/follow/reject`)
  },

  async removeFollower(userId) {
    return api.delete(`/users/${userId}/follower`)
  },

  async getPendingFollowRequests(page = 1) {
    return api.get('/users/follow-requests', { params: { page } })
  },

  async blockUser(userId) {
    return api.post(`/users/${userId}/block`)
  },

  async unblockUser(userId) {
    return api.delete(`/users/${userId}/block`)
  },

  async getBlockedUsers(page = 1) {
    return api.get('/users/blocked', { params: { page } })
  },

  async muteUser(userId, duration = null) {
    return api.post(`/users/${userId}/mute`, { duration })
  },

  async unmuteUser(userId) {
    return api.delete(`/users/${userId}/mute`)
  },

  async getMutedUsers(page = 1) {
    return api.get('/users/muted', { params: { page } })
  },

  async getSuggestions(limit = 5) {
    return api.get('/users/suggestions', { params: { limit } })
  },

  async searchUsers(query, page = 1) {
    return api.get('/users/search', { params: { q: query, page } })
  },
}

export default userService
