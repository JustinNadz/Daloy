import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate, formatNumber } from '../lib/utils'
import { Search, MoreVertical, Ban, CheckCircle, Trash2 } from 'lucide-react'

export default function Users() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, filter],
    queryFn: async () => {
      const res = await api.get('/users', {
        params: { page, search, filter },
      })
      return res.data
    },
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ userId, days, reason }) => {
      await api.post(`/users/${userId}/suspend`, { days, reason })
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

  const verifyMutation = useMutation({
    mutationFn: async (userId) => {
      await api.post(`/users/${userId}/verify`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
    },
  })

  const handleSuspend = (user) => {
    const days = prompt('Suspend for how many days? (0 for permanent)')
    if (days === null) return
    const reason = prompt('Reason for suspension:')
    if (reason === null) return
    suspendMutation.mutate({ userId: user.id, days: parseInt(days), reason })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="verified">Verified</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  User
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Followers
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Posts
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Joined
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                data?.data?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url}
                          alt={user.display_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium flex items-center gap-1">
                            {user.display_name}
                            {user.is_verified && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {formatNumber(user.followers_count)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatNumber(user.posts_count)}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_suspended ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          Suspended
                        </span>
                      ) : user.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!user.is_verified && (
                          <button
                            onClick={() => verifyMutation.mutate(user.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Verify user"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        {user.is_suspended ? (
                          <button
                            onClick={() => unsuspendMutation.mutate(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Unsuspend user"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Suspend user"
                          >
                            <Ban className="h-5 w-5" />
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
        {data?.meta && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {data.data.length} of {data.meta.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.meta.last_page}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
