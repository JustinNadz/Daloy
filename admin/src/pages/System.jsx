import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import {
  Server,
  Database,
  HardDrive,
  RefreshCw,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Cpu,
  Wifi,
  Zap,
} from 'lucide-react'

export default function System() {
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const queryClient = useQueryClient()

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['admin-system-status'],
    queryFn: async () => {
      const res = await api.get('/system/status')
      return res.data.data
    },
    refetchInterval: 30000,
  })

  const { data: backups, isLoading: backupsLoading } = useQuery({
    queryKey: ['admin-backups'],
    queryFn: async () => {
      const res = await api.get('/system/backups')
      return res.data.data
    },
  })

  const maintenanceMutation = useMutation({
    mutationFn: async ({ enabled, message }) => {
      await api.post('/system/maintenance', { enabled, message })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-system-status'])
    },
  })

  const cacheMutation = useMutation({
    mutationFn: async () => {
      await api.post('/system/cache/clear')
    },
    onSuccess: () => {
      alert('Cache cleared successfully')
    },
  })

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      await api.post('/system/optimize')
    },
    onSuccess: () => {
      alert('System optimized successfully')
    },
  })

  const backupMutation = useMutation({
    mutationFn: async () => {
      await api.post('/system/backup')
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-backups'])
      alert('Backup created successfully')
    },
  })

  const deleteBackupMutation = useMutation({
    mutationFn: async (filename) => {
      await api.delete(`/system/backups/${filename}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-backups'])
    },
  })

  const handleToggleMaintenance = () => {
    const newEnabled = !status?.maintenance_mode
    maintenanceMutation.mutate({
      enabled: newEnabled,
      message: maintenanceMessage || 'System is under maintenance. Please try again later.',
    })
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Sample performance data
  const performanceMetrics = [
    { label: 'CPU Usage', value: 42, color: 'bg-blue-500' },
    { label: 'Memory', value: 67, color: 'bg-purple-500' },
    { label: 'Storage', value: 54, color: 'bg-green-500' },
  ]

  const recentBackups = backups?.slice(0, 4) || [
    { filename: 'backup_2024-01-15_02-00.sql', size: 256000000, created_at: '2024-01-15T02:00:00Z', status: 'success' },
    { filename: 'backup_2024-01-14_02-00.sql', size: 254000000, created_at: '2024-01-14T02:00:00Z', status: 'success' },
    { filename: 'backup_2024-01-13_02-00.sql', size: 252000000, created_at: '2024-01-13T02:00:00Z', status: 'success' },
    { filename: 'backup_2024-01-12_02-00.sql', size: 250000000, created_at: '2024-01-12T02:00:00Z', status: 'success' },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Admin Console</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">System Settings</span>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900">System Settings & Maintenance</h1>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Operations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Maintenance Operations</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Clear Cache */}
              <button
                onClick={() => cacheMutation.mutate()}
                disabled={cacheMutation.isPending}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-3 bg-blue-100 rounded-xl">
                  <RefreshCw className={`w-6 h-6 text-blue-600 ${cacheMutation.isPending ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Clear Cache</p>
                  <p className="text-sm text-gray-500">Clear all system cache</p>
                </div>
              </button>

              {/* Optimize System */}
              <button
                onClick={() => optimizeMutation.mutate()}
                disabled={optimizeMutation.isPending}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Zap className={`w-6 h-6 text-purple-600 ${optimizeMutation.isPending ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Optimize System</p>
                  <p className="text-sm text-gray-500">Optimize routes & config</p>
                </div>
              </button>

              {/* Backup Database */}
              <button
                onClick={() => backupMutation.mutate()}
                disabled={backupMutation.isPending}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-3 bg-green-100 rounded-xl">
                  <Database className={`w-6 h-6 text-green-600 ${backupMutation.isPending ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Backup Database</p>
                  <p className="text-sm text-gray-500">Create manual backup</p>
                </div>
              </button>

              {/* Maintenance Mode */}
              <button
                onClick={handleToggleMaintenance}
                disabled={maintenanceMutation.isPending}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`p-3 rounded-xl ${status?.maintenance_mode ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <Server className={`w-6 h-6 ${status?.maintenance_mode ? 'text-yellow-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">
                    {status?.maintenance_mode ? 'Currently ON' : 'Currently OFF'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Automated Backups */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Recent Automated Backups</h3>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Backup Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBackups.map((backup, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Database className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{backup.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(backup.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatBytes(backup.size)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this backup?')) {
                                deleteBackupMutation.mutate(backup.filename)
                              }
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Actions */}
          <div className="bg-red-50 rounded-xl border border-red-100 p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Critical Actions</h3>
                <p className="text-sm text-gray-600 mt-1">
                  These actions can have significant impact on the platform. Proceed with caution.
                </p>
                <div className="flex gap-3 mt-4">
                  <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                    Reset Platform Statistics
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                    Purge All Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Live Performance */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Live Performance</h3>
            <div className="space-y-6">
              {performanceMetrics.map((metric, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{metric.value}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${metric.color} rounded-full transition-all duration-500`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Server Status</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Database</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Storage</span>
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {formatBytes(status?.storage?.used)} / {formatBytes(status?.storage?.total || 107374182400)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">API Latency</span>
                </div>
                <span className="text-xs font-medium text-green-600">45ms</span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Environment</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Laravel</span>
                <span className="font-medium text-gray-900">{status?.laravel_version || '11.x'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">PHP</span>
                <span className="font-medium text-gray-900">{status?.php_version || '8.2'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Database</span>
                <span className="font-medium text-gray-900">{status?.database?.driver || 'MySQL'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cache</span>
                <span className="font-medium text-gray-900">{status?.cache_driver || 'file'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
