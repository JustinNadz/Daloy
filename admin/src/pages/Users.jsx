import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import {
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Ban,
} from 'lucide-react'

export default function Users() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, activeTab],
    queryFn: async () => {
      const res = await api.get('/users', {
        params: { page, search, filter: activeTab },
      })
      return res.data
    },
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ userId }) => {
      await api.post(`/users/${userId}/suspend`, { days: 7 })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
    },
  })

  const unsuspendMutation = useMutation({
    mutationFn: async (userId) => {
      await api.post(`/users/${userId}/unsuspend`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
    },
  })

  const tabs = [
    { value: 'all', label: 'All Users' },
    { value: 'active', label: 'Active Only' },
    { value: 'banned', label: 'Banned' },
    { value: 'pending', label: 'Pending Review' },
  ]

  // Sample data for demo
  const sampleUsers = [
    { id: 1, username: 'ameliahartson', email: 'amelia@daloy.io', display_name: 'Amelia Hartson', avatar_url: null, created_at: '2023-10-24', is_verified: true, role: 'Moderator', status: 'active' },
    { id: 2, username: 'brandoncole', email: 'brandon@daloy.io', display_name: 'Brandon Cole', avatar_url: null, created_at: '2023-09-12', role: 'Regular User', status: 'active' },
    { id: 3, username: 'clarastone', email: 'clara@daloy.io', display_name: 'Clara Stone', avatar_url: null, created_at: '2024-01-01', role: 'Regular User', status: 'pending' },
    { id: 4, username: 'davidmiranda', email: 'david@daloy.io', display_name: 'David Miranda', avatar_url: null, created_at: '2024-02-15', role: 'Regular User', status: 'banned', is_banned: true },
    { id: 5, username: 'elaineyu', email: 'elaine@daloy.io', display_name: 'Elaine Yu', avatar_url: null, created_at: '2024-03-02', role: 'Moderator', status: 'active' },
  ]

  const users = data?.data?.length > 0 ? data.data : sampleUsers

  const getStatusBadge = (user) => {
    if (user.is_banned || user.status === 'banned') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Banned
        </span>
      )
    }
    if (user.suspended_until) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Suspended
        </span>
      )
    }
    if (user.status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Pending
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Active
      </span>
    )
  }

  const getRoleBadge = (role) => {
    if (role === 'Moderator' || role === 'Admin') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          {role}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        {role || 'Regular User'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlus className="h-4 w-4" />
          Add New User
        </button>
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>
        
        <div className="flex gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Role: All</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">Regular User</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.display_name || user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View Profile
                        </button>
                        {user.is_banned || user.status === 'banned' ? (
                          <button 
                            onClick={() => unsuspendMutation.mutate(user.id)}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            Unban
                          </button>
                        ) : (
                          <button 
                            onClick={() => suspendMutation.mutate({ userId: user.id })}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <Ban className="h-4 w-4" />
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Showing 1-{users.length} of {data?.meta?.total || users.length} users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                  page === p
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 border border-gray-200 hover:bg-white'
                }`}
              >
                {p}
              </button>
            ))}
            <span className="text-gray-400 px-1">...</span>
            <button
              onClick={() => setPage(10)}
              className="h-9 w-9 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-white transition-colors"
            >
              10
            </button>
            <button
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
