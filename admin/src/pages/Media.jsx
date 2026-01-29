import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import {
  Search,
  Image,
  Video,
  FileText,
  Trash2,
  MoreVertical,
  HardDrive,
  Download,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function Media() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedMedia, setSelectedMedia] = useState([])
  const [previewMedia, setPreviewMedia] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-media', search, typeFilter],
    queryFn: async () => {
      const res = await api.get('/media', {
        params: { search, type: typeFilter },
      })
      return res.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-media-stats'],
    queryFn: async () => {
      const res = await api.get('/media/stats')
      return res.data.data
    },
  })

  const { data: storage } = useQuery({
    queryKey: ['admin-media-storage'],
    queryFn: async () => {
      const res = await api.get('/media/storage')
      return res.data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      await api.delete(`/media/${id}`, { data: { reason } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media'])
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await api.post('/media/bulk-delete', { media_ids: ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media'])
      setSelectedMedia([])
    },
  })

  const handleDelete = (media) => {
    if (confirm('Are you sure you want to delete this media?')) {
      const reason = prompt('Reason for deletion (optional):')
      deleteMutation.mutate({ id: media.id, reason })
    }
  }

  const handleBulkDelete = () => {
    if (selectedMedia.length === 0) return
    if (confirm(`Delete ${selectedMedia.length} selected items?`)) {
      bulkDeleteMutation.mutate(selectedMedia)
    }
  }

  const toggleSelect = (id) => {
    setSelectedMedia((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const media = data?.data?.data || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Content</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Media Library</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">Manage uploaded files</p>
        </div>
        {selectedMedia.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedMedia.length})
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats?.total || 0}</p>
              <p className="text-sm text-gray-500">Total Files</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <HardDrive className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{formatBytes(stats?.total_size)}</p>
              <p className="text-sm text-gray-500">Total Size</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats?.recent_uploads || 0}</p>
              <p className="text-sm text-gray-500">Uploads (24h)</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div>
            <p className="text-sm text-gray-500 mb-2">Storage Used</p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${storage?.percentage || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formatBytes(storage?.used)} / {formatBytes(storage?.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No media found
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedMedia.includes(item.id) ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div
                  className="aspect-square bg-gray-100 cursor-pointer"
                  onClick={() => setPreviewMedia(item)}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                  )}
                </div>
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedMedia.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item)
                    }}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{item.filename}</p>
                  <p className="text-xs text-white/70">{formatBytes(item.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {previewMedia.type === 'image' ? (
              <img
                src={previewMedia.url}
                alt=""
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : previewMedia.type === 'video' ? (
              <video
                src={previewMedia.url}
                controls
                className="max-w-full max-h-[70vh]"
              />
            ) : null}
            <div className="p-4 border-t border-gray-200">
              <p className="font-medium">{previewMedia.filename}</p>
              <p className="text-sm text-gray-500">
                {formatBytes(previewMedia.size)} • Uploaded by @{previewMedia.user?.username}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(previewMedia.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
