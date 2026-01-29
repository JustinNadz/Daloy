import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { formatNumber } from '../lib/utils'
import {
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'

export default function Analytics() {
  const [range, setRange] = useState('30d')

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview', range],
    queryFn: async () => {
      const res = await api.get('/analytics/overview', { params: { range } })
      return res.data.data
    },
  })

  const { data: userGrowth } = useQuery({
    queryKey: ['analytics-user-growth', range],
    queryFn: async () => {
      const res = await api.get('/analytics/user-growth', { params: { range } })
      return res.data.data
    },
  })

  const handleExport = async (type) => {
    try {
      const res = await api.get('/analytics/export', {
        params: { type, range },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analytics_${type}_${range}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const ranges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ]

  const statCards = [
    {
      label: 'Total Users',
      value: overview?.users?.total || 124582,
      change: '+12%',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      positive: true,
    },
    {
      label: 'Active Posts',
      value: overview?.posts?.total || 8902,
      change: '+4.2%',
      icon: FileText,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      positive: true,
    },
    {
      label: 'Pending Reports',
      value: overview?.reports?.pending || 42,
      change: '+5',
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      positive: false,
    },
    {
      label: 'Engagement Rate',
      value: '64.8%',
      change: '-0.5%',
      icon: Activity,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      positive: false,
    },
  ]

  // Sample data for charts
  const userGrowthData = userGrowth || [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 78 },
    { month: 'Mar', value: 85 },
    { month: 'Apr', value: 92 },
    { month: 'May', value: 88 },
    { month: 'Jun', value: 105 },
    { month: 'Jul', value: 115 },
    { month: 'Aug', value: 125 },
  ]

  const postActivityData = [
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 78 },
    { day: 'Thu', value: 105 },
    { day: 'Fri', value: 95 },
    { day: 'Sat', value: 68 },
    { day: 'Sun', value: 55 },
  ]

  const demographicsData = [
    { label: '18-24', value: 35, color: 'bg-blue-500' },
    { label: '25-34', value: 40, color: 'bg-purple-500' },
    { label: '35-44', value: 15, color: 'bg-green-500' },
    { label: '45+', value: 10, color: 'bg-orange-500' },
  ]

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Admin Console</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">Platform Analytics</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Platform Analytics & Insights</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  range === r.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleExport('overview')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="text-3xl font-bold text-gray-900">
                    {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value)}
                  </p>
                  <span className={`text-xs font-medium flex items-center ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.positive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">User Growth</h3>
            <span className="text-xs text-gray-500">Last 8 months</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-3">
            {userGrowthData.map((item, index) => {
              const maxValue = Math.max(...userGrowthData.map(d => d.value || d.count || 0))
              const value = item.value || item.count || 0
              const height = (value / maxValue) * 200
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500"
                    style={{ height: `${Math.max(20, height)}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {item.month || new Date(item.date).toLocaleDateString('en', { month: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Post Activity Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Post Activity by Day</h3>
            <span className="text-xs text-gray-500">This week</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-3">
            {postActivityData.map((item, index) => {
              const maxValue = Math.max(...postActivityData.map(d => d.value))
              const height = (item.value / maxValue) * 200
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all hover:from-purple-700 hover:to-purple-500"
                    style={{ height: `${Math.max(20, height)}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Demographics & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audience Demographics */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Audience Demographics</h3>
          <div className="flex items-center justify-center mb-6">
            {/* Simple Pie Chart Representation */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {demographicsData.reduce((acc, item, index) => {
                  const prevOffset = acc.offset
                  const dashArray = item.value
                  const dashOffset = 100 - prevOffset
                  acc.offset += item.value
                  const colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f97316']
                  acc.elements.push(
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={colors[index]}
                      strokeWidth="20"
                      strokeDasharray={`${dashArray} ${100 - dashArray}`}
                      strokeDashoffset={dashOffset}
                    />
                  )
                  return acc
                }, { offset: 0, elements: [] }).elements}
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {demographicsData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Content */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Top Performing Content</h3>
          <div className="space-y-4">
            {[
              { title: 'Welcome to our community!', type: 'Announcement', engagement: 4523, growth: '+15%' },
              { title: 'Tips for better engagement', type: 'Post', engagement: 3218, growth: '+8%' },
              { title: 'Community guidelines update', type: 'Announcement', engagement: 2891, growth: '+12%' },
              { title: 'Monthly highlights recap', type: 'Post', engagement: 2156, growth: '+5%' },
            ].map((content, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{content.title}</p>
                    <p className="text-xs text-gray-500">{content.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatNumber(content.engagement)}</p>
                  <p className="text-xs text-green-500">{content.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
