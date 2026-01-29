import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import {
  Search,
  MoreVertical,
  MessageCircle,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  User,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

export default function Comments() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionMenuOpen, setActionMenuOpen] = useState(null)
  const [selectedComments, setSelectedComments] = useState([])
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/comments', {
        params: { search, status: statusFilter },
      })
      return res.data
    },
  })

  const hideMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      await api.post(`/comments/${id}/hide`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments'])
      setActionMenuOpen(null)
    },
  })

  const unhideMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/comments/${id}/unhide`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments'])
      setActionMenuOpen(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      await api.delete(`/comments/${id}`, { data: { reason } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments'])
      setActionMenuOpen(null)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await api.post('/comments/bulk-delete', { comment_ids: ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments'])
      setSelectedComments([])
    },
  })

  const handleHide = (comment) => {
    const reason = prompt('Reason for hiding (optional):')
    hideMutation.mutate({ id: comment.id, reason })
  }

  const handleDelete = (comment) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      const reason = prompt('Reason for deletion (optional):')
      deleteMutation.mutate({ id: comment.id, reason })
    }
  }

  const handleBulkDelete = () => {
    if (selectedComments.length === 0) return
    if (confirm(`Delete ${selectedComments.length} selected comments?`)) {
      bulkDeleteMutation.mutate(selectedComments)
    }
  }

  const toggleSelect = (id) => {
    setSelectedComments((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([])
    } else {
      setSelectedComments(comments.map((c) => c.id))
    }
  }

  const comments = data?.data?.data || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Content</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Comments</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
          <p className="text-gray-500 mt-1">Moderate user comments</p>
        </div>
        {selectedComments.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedComments.length})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Comments</option>
            <option value="reported">Reported</option>
            <option value="hidden">Hidden</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedComments.length === comments.length && comments.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Comment</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">On Post</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-900"></div>
                  </div>
                </td>
              </tr>
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No comments found
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedComments.includes(comment.id)}
                      onChange={() => toggleSelect(comment.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                        {comment.content}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {comment.user?.avatar_url ? (
                        <img
                          src={comment.user.avatar_url}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-500" />
                        </div>
                      )}
                      <span className="text-sm text-gray-600">@{comment.user?.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 line-clamp-1 max-w-32">
                      {comment.parent?.content?.substring(0, 30)}...
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {comment.is_hidden ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        Hidden
                      </span>
                    ) : comment.reports_count > 0 ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Reported
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-600">
                        Visible
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(comment.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === comment.id ? null : comment.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {actionMenuOpen === comment.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          {comment.is_hidden ? (
                            <button
                              onClick={() => unhideMutation.mutate(comment.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Unhide
                            </button>
                          ) : (
                            <button
                              onClick={() => handleHide(comment)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <EyeOff className="w-4 h-4" />
                              Hide
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(comment)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
