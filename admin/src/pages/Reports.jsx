import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDateTime } from '../lib/utils'
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  FileText,
  MessageSquare,
  Gavel,
  ChevronRight,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Clock,
  LogOut,
} from 'lucide-react'

export default function Reports() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [activeNav, setActiveNav] = useState('posts')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page, filter, activeNav],
    queryFn: async () => {
      const res = await api.get('/reports', {
        params: { page, status: filter !== 'all' ? filter : undefined, type: activeNav },
      })
      return res.data
    },
  })

  const resolveMutation = useMutation({
    mutationFn: async ({ reportId, action }) => {
      await api.post(`/reports/${reportId}/${action}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reports'])
    },
  })

  const handleAction = (reportId, action) => {
    resolveMutation.mutate({ reportId, action })
  }

  const navItems = [
    { key: 'posts', label: 'Posts', icon: FileText, count: 24 },
    { key: 'comments', label: 'Comments', icon: MessageSquare, count: 12 },
    { key: 'appeals', label: 'Appeals', icon: Gavel, count: 5 },
  ]

  const filterTabs = [
    { value: 'all', label: 'All Reports' },
    { value: 'hate_speech', label: 'Hate Speech' },
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
  ]

  // Sample reports for demo
  const sampleReports = [
    {
      id: 1,
      user: { name: 'Robert Patterson', username: '@robertp', avatar: null },
      badges: [
        { label: 'Hate Speech', color: 'bg-red-100 text-red-700' },
        { label: 'HIGH PRIORITY', color: 'bg-orange-100 text-orange-700' },
      ],
      content: "This post contains harmful language that violates community guidelines regarding respectful discourse...",
      stats: { likes: 142, dislikes: 89, shares: 23 },
      time: '4 hours ago',
      reporters: 12,
      status: 'pending',
    },
    {
      id: 2,
      user: { name: 'Jessica Stone', username: '@jessicast', avatar: null },
      badges: [
        { label: 'Spam', color: 'bg-yellow-100 text-yellow-700' },
      ],
      content: "Buy followers now! Best prices guaranteed. Visit my profile for exclusive deals on social media growth...",
      stats: { likes: 5, dislikes: 234, shares: 1 },
      time: '6 hours ago',
      reporters: 28,
      status: 'pending',
    },
    {
      id: 3,
      user: { name: 'Mike Thompson', username: '@miket', avatar: null },
      badges: [
        { label: 'Harassment', color: 'bg-purple-100 text-purple-700' },
      ],
      content: "Targeted messages directed at specific users with threatening undertones that create an unsafe environment...",
      stats: { likes: 12, dislikes: 156, shares: 3 },
      time: '8 hours ago',
      reporters: 8,
      status: 'pending',
    },
  ]

  const recentActions = [
    { action: 'Post Deleted', id: '#RPT-1024', time: '2m ago' },
    { action: 'User Warned', id: '#RPT-1023', time: '15m ago' },
    { action: 'Appeal Reviewed', id: '#APL-512', time: '1h ago' },
  ]

  const reports = data?.data?.length > 0 ? data.data : sampleReports

  return (
    <div className="flex gap-6 -m-6 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar Navigation */}
      <div className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col">
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeNav === item.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeNav === item.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {item.count}
              </span>
            </button>
          ))}
        </nav>

        {/* History Section */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">History</p>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Clock className="h-4 w-4" />
              <span>Recent Actions</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-6 pr-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span>Admin Console</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Content Moderation</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Content Moderation</h1>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Bulk Actions
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Refresh Feed
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No reports found
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                {/* Report Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
                      {report.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{report.user?.name || 'Unknown User'}</h3>
                        <span className="text-sm text-gray-500">{report.user?.username}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {report.badges?.map((badge, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{report.time || formatDateTime(report.created_at)}</p>
                    <p className="text-xs text-gray-400 mt-1">Reported by {report.reporters || 1} users</p>
                  </div>
                </div>

                {/* Report Content */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {report.content || report.description}
                  </p>
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{report.stats?.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ThumbsDown className="h-4 w-4" />
                      <span>{report.stats?.dislikes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Share2 className="h-4 w-4" />
                      <span>{report.stats?.shares || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(report.id, 'keep')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Keep
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'hide')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'delete')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar - Filters */}
      <div className="w-72 bg-white border-l border-gray-200 p-5">
        {/* Filter Reports */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Filter Reports</h3>
          
          {/* Priority */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
            <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Priorities</option>
              <option>High Priority</option>
              <option>Medium Priority</option>
              <option>Low Priority</option>
            </select>
          </div>

          {/* Content Type */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Content Type</label>
            <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Content</option>
              <option>Text Posts</option>
              <option>Images</option>
              <option>Videos</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
            <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>

          <button className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            Apply Filters
          </button>
        </div>

        {/* Moderator Stats */}
        <div className="border-t border-gray-200 pt-5">
          <h3 className="font-semibold text-gray-900 mb-4">Moderator Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reviewed Today</span>
              <span className="text-sm font-semibold text-gray-900">47</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Response Time</span>
              <span className="text-sm font-semibold text-gray-900">12m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accuracy Rate</span>
              <span className="text-sm font-semibold text-green-600">98.2%</span>
            </div>
          </div>
        </div>

        {/* Recent Actions */}
        <div className="border-t border-gray-200 pt-5 mt-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Actions</h3>
          <div className="space-y-3">
            {recentActions.map((action, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{action.action}</p>
                  <p className="text-xs text-gray-500">{action.id}</p>
                </div>
                <span className="text-xs text-gray-400">{action.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
