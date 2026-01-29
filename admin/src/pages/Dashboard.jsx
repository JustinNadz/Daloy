import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { formatNumber } from '../lib/utils'
import {
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Megaphone,
  UserPlus,
  Download,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats')
      return res.data.data
    },
  })

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.users?.total || 124582,
      change: '+12%',
      subtext: 'SINCE LAST MONTH',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      positive: true,
    },
    {
      label: 'Active Posts',
      value: stats?.posts?.total || 8902,
      change: '+4.2%',
      subtext: 'IN LAST 24 HOURS',
      icon: FileText,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      positive: true,
    },
    {
      label: 'Pending Reports',
      value: stats?.reports?.pending || 42,
      change: '+5 High Priority',
      subtext: 'REQUIRES ACTION',
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      isAlert: true,
    },
    {
      label: 'Engagement Rate',
      value: '64.8%',
      change: '-0.5%',
      subtext: 'ENGAGEMENT METRICS',
      icon: Activity,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      positive: false,
    },
  ]

  const recentActivity = [
    { type: 'Content Flagged', user: 'John Doe', time: '2 mins ago', status: 'PENDING', statusColor: 'text-orange-500' },
    { type: 'Account Suspended', user: 'Spam Master', time: '15 mins ago', status: 'RESOLVED', statusColor: 'text-green-500' },
    { type: 'Post Approved', user: 'Sarah King', time: '1 hour ago', status: 'RESOLVED', statusColor: 'text-green-500' },
  ]

  const quickActions = [
    { label: 'New Announcement', desc: 'Broadcast to all users', icon: Megaphone, to: '/announcements' },
    { label: 'Create Moderator', desc: 'Add administrative staff', icon: UserPlus, to: '/users' },
    { label: 'Export Platform Logs', desc: 'Generate CSV reports', icon: Download, to: '/logs' },
  ]

  if (isLoading) {
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
        <span className="text-gray-900">Dashboard Overview</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-900">System Overview</h1>

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
                  <span className={`text-xs font-medium ${stat.isAlert ? 'text-red-500' : stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.isAlert ? '' : stat.positive ? <TrendingUp className="inline h-3 w-3 mr-0.5" /> : <TrendingDown className="inline h-3 w-3 mr-0.5" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">{stat.subtext}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Moderation Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Moderation Activity</h3>
            <Link to="/reports" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          <div className="p-5">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Action Type</th>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.type.includes('Flagged') ? 'bg-orange-400' :
                          item.type.includes('Suspended') ? 'bg-red-400' : 'bg-green-400'
                        }`} />
                        <span className="text-sm text-gray-700">{item.type}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-600">{item.user}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-500">{item.time}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-3">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  to={action.to}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <action.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* System Notice */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">System Notice</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Scheduled maintenance for Database Node 6 is set for <strong>Sunday at 02:00 UTC</strong>. Minimal downtime expected.
                </p>
                <Link to="/system" className="text-xs text-blue-600 font-medium mt-2 inline-block hover:text-blue-700">
                  Read details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
