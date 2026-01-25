import api from './api'

export const searchService = {
  async search(query, type = 'all', page = 1) {
    return api.get('/search', {
      params: { q: query, type, page },
    })
  },

  async searchUsers(query, page = 1) {
    return api.get('/search/users', {
      params: { q: query, page },
    })
  },

  async searchPosts(query, page = 1, filters = {}) {
    return api.get('/search/posts', {
      params: { q: query, page, ...filters },
    })
  },

  async searchHashtags(query, page = 1) {
    return api.get('/search/hashtags', {
      params: { q: query, page },
    })
  },

  async getTrending(limit = 10) {
    return api.get('/search/trending', {
      params: { limit },
    })
  },

  async getHashtagPosts(hashtag, page = 1) {
    return api.get(`/search/hashtag/${hashtag}`, {
      params: { page },
    })
  },

  async getRecentSearches() {
    return api.get('/search/recent')
  },

  async saveSearch(query) {
    return api.post('/search/recent', { query })
  },

  async clearRecentSearches() {
    return api.delete('/search/recent')
  },
}

export default searchService
