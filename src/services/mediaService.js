import api from './api'

export const mediaService = {
  async uploadMedia(file, onProgress = null) {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        : undefined,
    })
  },

  async uploadMultiple(files, onProgress = null) {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    return api.post('/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        : undefined,
    })
  },

  async deleteMedia(mediaId) {
    return api.delete(`/media/${mediaId}`)
  },

  async getMedia(mediaId) {
    return api.get(`/media/${mediaId}`)
  },

  getMediaUrl(path) {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${api.defaults.baseURL.replace('/api', '')}/storage/${path}`
  },

  async updateAltText(mediaId, altText) {
    return api.put(`/media/${mediaId}`, { alt_text: altText })
  },
}

export default mediaService
