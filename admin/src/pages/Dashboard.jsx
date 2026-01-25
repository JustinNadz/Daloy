import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { formatNumber } from '../lib/utils'
import {
  Users,
  FileText,
  Flag,
  TrendingUp,
  UserPlus,
  MessageSquare,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

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
      value: stats?.users?.total || 0,
      change: stats?.users?.change || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Posts',
      value: stats?.posts?.total || 0,
      change: stats?.posts?.change || 0,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      label: 'Pending Reports',
      value: stats?.reports?.pending || 0,
      change: stats?.reports?.change || 0,
      icon: Flag,
      color: 'bg-red-500',
    },
    {
      label: 'New Users Today',
      value: stats?.users?.today || 0,
      change: 0,
      icon: UserPlus,
      color: 'bg-purple-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">
                  {formatNumber(stat.value)}
                </p>
                {stat.change !== 0 && (
                  <p
                    className={`text-sm mt-1 ${
                      stat.change > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {stat.change > 0 ? '+' : ''}
                    {stat.change}% from last week
                  </p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.charts?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Posts Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.charts?.postActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
        <div className="space-y-4">
          {stats?.recentReports?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent reports</p>
          ) : (
            stats?.recentReports?.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{report.reason}</p>
                  <p className="text-sm text-gray-500">
                    Reported by @{report.reporter?.username}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    report.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : report.status === 'resolved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {report.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
