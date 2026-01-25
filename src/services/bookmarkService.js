import api from './api'

export const bookmarkService = {
  async getBookmarks(collectionId = null, page = 1) {
    const params = { page }
    if (collectionId) params.collection_id = collectionId
    return api.get('/bookmarks', { params })
  },

  async addBookmark(postId, collectionId = null) {
    return api.post('/bookmarks', {
      post_id: postId,
      collection_id: collectionId,
    })
  },

  async removeBookmark(postId) {
    return api.delete(`/bookmarks/${postId}`)
  },

  async moveBookmark(postId, collectionId) {
    return api.put(`/bookmarks/${postId}`, {
      collection_id: collectionId,
    })
  },

  async getCollections() {
    return api.get('/bookmarks/collections')
  },

  async createCollection(name, description = null) {
    return api.post('/bookmarks/collections', { name, description })
  },

  async updateCollection(collectionId, data) {
    return api.put(`/bookmarks/collections/${collectionId}`, data)
  },

  async deleteCollection(collectionId) {
    return api.delete(`/bookmarks/collections/${collectionId}`)
  },

  async getCollectionBookmarks(collectionId, page = 1) {
    return api.get(`/bookmarks/collections/${collectionId}`, {
      params: { page },
    })
  },
}

export default bookmarkService
