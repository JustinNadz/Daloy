import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import {
  Search,
  Plus,
  MoreVertical,
  Megaphone,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

export default function Announcements() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target: 'all',
    is_dismissible: true,
    starts_at: '',
    ends_at: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements', statusFilter],
    queryFn: async () => {
      const res = await api.get('/announcements', {
        params: { status: statusFilter },
      })
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post('/announcements', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-announcements'])
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await api.put(`/announcements/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-announcements'])
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/announcements/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-announcements'])
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/announcements/${id}/toggle`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-announcements'])
      setActionMenuOpen(null)
    },
  })

  const openCreateModal = () => {
    setEditingAnnouncement(null)
    setFormData({
      title: '',
      content: '',
      type: 'info',
      target: 'all',
      is_dismissible: true,
      starts_at: '',
      ends_at: '',
    })
    setModalOpen(true)
  }

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target: announcement.target,
      is_dismissible: announcement.is_dismissible,
      starts_at: announcement.starts_at?.slice(0, 16) || '',
      ends_at: announcement.ends_at?.slice(0, 16) || '',
    })
    setModalOpen(true)
    setActionMenuOpen(null)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingAnnouncement(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      starts_at: formData.starts_at || null,
      ends_at: formData.ends_at || null,
    }
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleDelete = (announcement) => {
    if (confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      deleteMutation.mutate(announcement.id)
    }
    setActionMenuOpen(null)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Info className="w-4 h-4 text-blue-600" />
    }
  }

  const getTypeBadge = (type) => {
    const styles = {
      info: 'bg-blue-50 text-blue-700',
      warning: 'bg-yellow-50 text-yellow-700',
      success: 'bg-green-50 text-green-700',
      error: 'bg-red-50 text-red-700',
    }
    return styles[type] || styles.info
  }

  const announcements = data?.data?.data || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Moderation</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Announcements</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Broadcast messages to users</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All Announcements</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No announcements found
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-xl border border-gray-200 p-5 ${
                !announcement.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTypeBadge(announcement.type).replace('text', 'bg').split(' ')[0]}`}>
                    {getTypeIcon(announcement.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadge(announcement.type)}`}>
                        {announcement.type}
                      </span>
                      <span className="text-xs text-gray-500">Target: {announcement.target}</span>
                      {announcement.starts_at && (
                        <span className="text-xs text-gray-500">
                          Starts: {formatDate(announcement.starts_at)}
                        </span>
                      )}
                      {announcement.ends_at && (
                        <span className="text-xs text-gray-500">
                          Ends: {formatDate(announcement.ends_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    announcement.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {announcement.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === announcement.id ? null : announcement.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {actionMenuOpen === announcement.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => openEditModal(announcement)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate(announcement.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          {announcement.is_active ? (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(announcement)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="all">All Users</option>
                    <option value="users">Regular Users</option>
                    <option value="verified">Verified Only</option>
                    <option value="new">New Users</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dismissible"
                  checked={formData.is_dismissible}
                  onChange={(e) => setFormData({ ...formData, is_dismissible: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="dismissible" className="text-sm text-gray-700">
                  Allow users to dismiss
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {editingAnnouncement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
