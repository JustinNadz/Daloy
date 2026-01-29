import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDateTime } from '../lib/utils'
import {
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  FileText,
  User,
  Calendar,
  Globe,
} from 'lucide-react'

export default function Logs() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const queryClient = useQuery

  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', search, actionFilter, dateFrom, dateTo],
    queryFn: async () => {
      const res = await api.get('/logs', {
        params: { search, action: actionFilter, date_from: dateFrom, date_to: dateTo },
      })
      return res.data
    },
  })

  const { data: actionsData } = useQuery({
    queryKey: ['admin-log-actions'],
    queryFn: async () => {
      const res = await api.get('/logs/actions')
      return res.data
    },
  })

  const handleExport = async () => {
    try {
      const response = await api.get('/logs/export', {
        params: { date_from: dateFrom, date_to: dateTo },
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'admin_logs.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getActionBadge = (action) => {
    const colors = {
      login: 'bg-blue-50 text-blue-700',
      logout: 'bg-gray-50 text-gray-600',
      suspended_user: 'bg-yellow-50 text-yellow-700',
      unsuspended_user: 'bg-green-50 text-green-700',
      deleted_user: 'bg-red-50 text-red-700',
      deleted_post: 'bg-red-50 text-red-700',
      deleted_group: 'bg-red-50 text-red-700',
      suspended_group: 'bg-yellow-50 text-yellow-700',
      restored_group: 'bg-green-50 text-green-700',
      cancelled_event: 'bg-orange-50 text-orange-700',
      resolved_report: 'bg-green-50 text-green-700',
      dismissed_report: 'bg-gray-50 text-gray-600',
      updated_settings: 'bg-purple-50 text-purple-700',
    }
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[action] || 'bg-gray-50 text-gray-600'}`}>
        {action?.replace(/_/g, ' ')}
      </span>
    )
  }

  // Sample data
  const sampleLogs = [
    { id: 1, admin: { name: 'Admin' }, action: 'login', description: 'Admin logged in', ip_address: '192.168.1.1', created_at: '2024-01-26T10:30:00' },
    { id: 2, admin: { name: 'Admin' }, action: 'suspended_user', description: 'Suspended user: spammer123', ip_address: '192.168.1.1', created_at: '2024-01-26T10:35:00' },
    { id: 3, admin: { name: 'Admin' }, action: 'deleted_post', description: 'Deleted post #1234 for spam', ip_address: '192.168.1.1', created_at: '2024-01-26T11:00:00' },
    { id: 4, admin: { name: 'Admin' }, action: 'resolved_report', description: 'Resolved report #56', ip_address: '192.168.1.1', created_at: '2024-01-26T11:15:00' },
    { id: 5, admin: { name: 'Admin' }, action: 'updated_settings', description: 'Updated maintenance_mode setting', ip_address: '192.168.1.1', created_at: '2024-01-26T12:00:00' },
  ]

  const logs = data?.data?.length > 0 ? data.data : sampleLogs
  const actions = actionsData?.data || ['login', 'logout', 'suspended_user', 'deleted_post', 'resolved_report', 'updated_settings']

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>System</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Activity Logs</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track admin activity and actions</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="relative">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
          >
            <option value="">All Actions</option>
            {actions.map((action) => (
              <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="From"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="To"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">IP Address</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">No logs found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">#{log.id}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{log.admin?.name || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">{getActionBadge(log.action)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 max-w-[300px] truncate">{log.description}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Globe className="h-3.5 w-3.5" />
                        {log.ip_address}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateTime(log.created_at)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
