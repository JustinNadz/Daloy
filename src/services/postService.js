import api from './api'

export const postService = {
  async getFeed(page = 1) {
    return api.get('/posts/feed', { params: { page } })
  },

  async getExplore(page = 1) {
    return api.get('/posts/explore', { params: { page } })
  },

  async getPost(id) {
    return api.get(`/posts/${id}`)
  },

  async createPost(content, privacy = 'public', media = []) {
    const formData = new FormData()
    formData.append('content', content)
    formData.append('privacy', privacy)
    media.forEach((file) => formData.append('media[]', file))
    
    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async updatePost(id, content, privacy) {
    return api.put(`/posts/${id}`, { content, privacy })
  },

  async deletePost(id) {
    return api.delete(`/posts/${id}`)
  },

  async getComments(postId, page = 1) {
    return api.get(`/posts/${postId}/comments`, { params: { page } })
  },

  async addComment(postId, content, media = []) {
    const formData = new FormData()
    formData.append('content', content)
    media.forEach((file) => formData.append('media[]', file))
    
    return api.post(`/posts/${postId}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async repost(postId) {
    return api.post(`/posts/${postId}/repost`)
  },

  async undoRepost(postId) {
    return api.delete(`/posts/${postId}/repost`)
  },

  async quotePost(postId, content) {
    return api.post(`/posts/${postId}/quote`, { content })
  },

  async likePost(postId, type = 'like') {
    return api.post(`/posts/${postId}/reactions`, { type })
  },

  async unlikePost(postId) {
    return api.delete(`/posts/${postId}/reactions`)
  },

  async bookmarkPost(postId, collectionId = null) {
    return api.post(`/posts/${postId}/bookmark`, { collection_id: collectionId })
  },

  async unbookmarkPost(postId) {
    return api.delete(`/posts/${postId}/bookmark`)
  },

  async getUserPosts(username, page = 1) {
    return api.get(`/users/${username}/posts`, { params: { page } })
  },
}

export default postService
