import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import {
  Search,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react'

// Severity badge component
function SeverityBadge({ severity }) {
  const styles = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider border ${styles[severity] || styles.medium}`}>
      {severity}
    </span>
  )
}

// AI flagged badge
function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
      <Bot className="h-3 w-3" />
      AI
    </span>
  )
}

export default function Posts() {
  const [activeTab, setActiveTab] = useState('active')
  const [search, setSearch] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', search, reasonFilter, severityFilter],
    queryFn: async () => {
      const res = await api.get('/reports', {
        params: { search, reason: reasonFilter, severity: severityFilter },
      })
      return res.data
    },
  })

  const resolveMutation = useMutation({
    mutationFn: async ({ reportId, action }) => {
      await api.post(`/reports/${reportId}/resolve`, { action })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reports'])
      setSelectedReport(null)
    },
  })

  // Sample reports for demo
  const sampleReports = [
    {
      id: 1,
      report_id: 'RPT-2024-0156',
      reason: 'Harassment',
      severity: 'high',
      ai_flagged: true,
      ai_confidence: 89,
      created_at: '2024-01-15T10:30:00Z',
      reported_user: { id: 12, username: 'toxic_user', display_name: 'Toxic User', avatar_url: null },
      reporter: { id: 5, username: 'reporter_user', display_name: 'Reporter' },
      post: { id: 234, content: 'This content has been flagged for review due to potential policy violations.' },
      status: 'pending',
    },
    {
      id: 2,
      report_id: 'RPT-2024-0155',
      reason: 'Spam',
      severity: 'medium',
      ai_flagged: true,
      ai_confidence: 75,
      created_at: '2024-01-15T09:15:00Z',
      reported_user: { id: 15, username: 'spammer', display_name: 'Spammer Account', avatar_url: null },
      reporter: { id: 8, username: 'user123', display_name: 'User 123' },
      post: { id: 567, content: 'Check out this amazing deal! Click here for free stuff!' },
      status: 'pending',
    },
    {
      id: 3,
      report_id: 'RPT-2024-0154',
      reason: 'Misinformation',
      severity: 'low',
      ai_flagged: false,
      created_at: '2024-01-15T08:45:00Z',
      reported_user: { id: 20, username: 'news_sharer', display_name: 'News Sharer', avatar_url: null },
      reporter: { id: 3, username: 'fact_checker', display_name: 'Fact Checker' },
      post: { id: 890, content: 'You wont believe what scientists discovered!' },
      status: 'pending',
    },
    {
      id: 4,
      report_id: 'RPT-2024-0153',
      reason: 'Hate Speech',
      severity: 'high',
      ai_flagged: true,
      ai_confidence: 92,
      created_at: '2024-01-14T16:20:00Z',
      reported_user: { id: 25, username: 'offender', display_name: 'Offender', avatar_url: null },
      reporter: { id: 10, username: 'community_mod', display_name: 'Community Mod' },
      post: { id: 111, content: '[Content hidden due to policy violation]' },
      status: 'pending',
    },
  ]

  const reports = data?.data?.length > 0 ? data.data : sampleReports
  const currentReport = selectedReport || reports[0]

  const tabs = [
    { value: 'active', label: 'Active Reports', count: 24 },
    { value: 'history', label: 'Moderation History' },
    { value: 'blocked', label: 'Blocked Users' },
  ]

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000 / 60)
    if (diff < 60) return `${diff} min ago`
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`
    return `${Math.floor(diff / 1440)} days ago`
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Content</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Posts</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-500 mt-1">Review and moderate flagged content</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.count && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.value ? 'bg-white/20' : 'bg-red-100 text-red-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <div className="relative">
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
          >
            <option value="">Reason</option>
            <option value="harassment">Harassment</option>
            <option value="spam">Spam</option>
            <option value="hate_speech">Hate Speech</option>
            <option value="misinformation">Misinformation</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
          >
            <option value="">Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-180px)]">
        {/* Reports List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">{reports.length} pending</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
              </div>
            ) : (
              reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    currentReport?.id === report.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityBadge severity={report.severity} />
                        {report.ai_flagged && <AIBadge />}
                      </div>
                      <h4 className="text-gray-900 font-medium truncate text-sm">
                        {report.report_id} - {report.reason}
                      </h4>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {report.post?.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {getTimeAgo(report.created_at)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Report Details */}
        {currentReport && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{currentReport.report_id}</h3>
                  <p className="text-sm text-gray-500">
                    {currentReport.reason} • {getTimeAgo(currentReport.created_at)}
                  </p>
                </div>
                <SeverityBadge severity={currentReport.severity} />
              </div>

              {/* AI Analysis */}
              {currentReport.ai_flagged && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">AI Analysis</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ width: `${currentReport.ai_confidence}%` }}
                        />
                      </div>
                      <span className="text-gray-900 font-medium text-sm">{currentReport.ai_confidence}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                    {currentReport.reported_user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{currentReport.reported_user?.display_name}</p>
                    <p className="text-sm text-gray-500">@{currentReport.reported_user?.username}</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium">
                  <ExternalLink className="h-4 w-4" />
                  View Profile
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Content</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 text-sm">{currentReport.post?.content}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => resolveMutation.mutate({ reportId: currentReport.id, action: 'keep' })}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <CheckCircle className="h-4 w-4" />
                  Keep
                </button>
                <button
                  onClick={() => resolveMutation.mutate({ reportId: currentReport.id, action: 'warn' })}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Warn
                </button>
                <button
                  onClick={() => resolveMutation.mutate({ reportId: currentReport.id, action: 'remove' })}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <XCircle className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
