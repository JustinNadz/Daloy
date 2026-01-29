import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatNumber } from '../lib/utils'
import {
  Search,
  Hash,
  TrendingUp,
  Ban,
  RotateCcw,
  MoreVertical,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

export default function Hashtags() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('posts_count')
  const [actionMenuOpen, setActionMenuOpen] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-hashtags', search, statusFilter, sortBy],
    queryFn: async () => {
      const res = await api.get('/hashtags', {
        params: { search, status: statusFilter, sort: sortBy },
      })
      return res.data
    },
  })

  const { data: trending } = useQuery({
    queryKey: ['admin-hashtags-trending'],
    queryFn: async () => {
      const res = await api.get('/hashtags/trending')
      return res.data.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-hashtags-stats'],
    queryFn: async () => {
      const res = await api.get('/hashtags/stats')
      return res.data.data
    },
  })

  const banMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      await api.post(`/hashtags/${id}/ban`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hashtags'])
      setActionMenuOpen(null)
    },
  })

  const unbanMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/hashtags/${id}/unban`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hashtags'])
      setActionMenuOpen(null)
    },
  })

  const handleBan = (hashtag) => {
    const reason = prompt('Reason for banning (optional):')
    banMutation.mutate({ id: hashtag.id, reason })
  }

  const hashtags = data?.data?.data || []

  // Sample data for demo
  const sampleHashtags = hashtags.length > 0 ? hashtags : [
    { id: 1, name: 'trending', posts_count: 45200, is_banned: false },
    { id: 2, name: 'viral', posts_count: 32100, is_banned: false },
    { id: 3, name: 'photooftheday', posts_count: 28500, is_banned: false },
    { id: 4, name: 'spam_content', posts_count: 1200, is_banned: true },
    { id: 5, name: 'dailylife', posts_count: 15800, is_banned: false },
  ]

  const sampleTrending = trending?.length > 0 ? trending : [
    { id: 1, name: 'NewYear2026', recent_count: 12500 },
    { id: 2, name: 'TechNews', recent_count: 8900 },
    { id: 3, name: 'MondayMotivation', recent_count: 7200 },
    { id: 4, name: 'FoodPorn', recent_count: 5600 },
    { id: 5, name: 'TravelDiaries', recent_count: 4800 },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Admin Console</span>
        <ChevronRight className="w-4 h-4" />
        <span>Content</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">Hashtags</span>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900">Hashtag Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Hashtags</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.total || 1247)}</p>
              <p className="text-xs text-gray-400 mt-1">+24 this week</p>
            </div>
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Active Today</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.active_today || 892)}</p>
              <p className="text-xs text-green-500 mt-1">+12% from yesterday</p>
            </div>
            <div className="p-2.5 bg-green-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Banned</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.banned || 15)}</p>
              <p className="text-xs text-gray-400 mt-1">Policy violations</p>
            </div>
            <div className="p-2.5 bg-red-100 rounded-xl">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Trending */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          Trending Now
        </h3>
        <div className="flex flex-wrap gap-2">
          {sampleTrending.slice(0, 10).map((tag) => (
            <span
              key={tag.id}
              className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full text-sm border border-blue-100 hover:border-blue-200 transition-colors cursor-pointer"
            >
              <span className="text-blue-600 font-medium">#{tag.name}</span>
              <span className="ml-2 text-xs text-gray-500">{formatNumber(tag.recent_count)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hashtags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="posts_count">Most Used</option>
              <option value="created_at">Newest</option>
              <option value="name">Alphabetical</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hashtag</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Posts</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : sampleHashtags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hashtags found
                </td>
              </tr>
            ) : (
              sampleHashtags.map((hashtag) => (
                <tr key={hashtag.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 rounded-lg">
                        <Hash className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-medium text-gray-900">#{hashtag.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{formatNumber(hashtag.posts_count)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {hashtag.is_banned ? (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === hashtag.id ? null : hashtag.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {actionMenuOpen === hashtag.id && (
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          {hashtag.is_banned ? (
                            <button
                              onClick={() => unbanMutation.mutate(hashtag.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBan(hashtag)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            >
                              <Ban className="w-4 h-4" />
                              Ban
                            </button>
                          )}
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
