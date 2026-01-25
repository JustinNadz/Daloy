import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate, formatNumber } from '../lib/utils'
import { Search, Trash2, Eye, EyeOff } from 'lucide-react'

export default function Posts() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts', page, search, filter],
    queryFn: async () => {
      const res = await api.get('/posts', {
        params: { page, search, filter },
      })
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      await api.delete(`/posts/${postId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-posts'])
    },
  })

  const handleDelete = (post) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(post.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
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
          <option value="all">All Posts</option>
          <option value="reported">Reported</option>
          <option value="with_media">With Media</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Author
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Content
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Likes
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Comments
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Reports
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Created
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
                    No posts found
                  </td>
                </tr>
              ) : (
                data?.data?.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.user?.avatar_url}
                          alt={post.user?.display_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{post.user?.display_name}</p>
                          <p className="text-sm text-gray-500">
                            @{post.user?.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-xs truncate">{post.content}</p>
                      {post.media?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          +{post.media.length} media
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatNumber(post.likes_count)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatNumber(post.comments_count)}
                    </td>
                    <td className="px-6 py-4">
                      {post.reports_count > 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          {post.reports_count} reports
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            window.open(`http://localhost:5173/post/${post.id}`, '_blank')
                          }
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="View post"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete post"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
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
              Showing {data.data.length} of {data.meta.total} posts
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
