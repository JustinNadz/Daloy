import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDateTime } from '../lib/utils'
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react'

export default function Reports() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('pending')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page, filter],
    queryFn: async () => {
      const res = await api.get('/reports', {
        params: { page, status: filter },
      })
      return res.data
    },
  })

  const resolveMutation = useMutation({
    mutationFn: async ({ reportId, action, notes }) => {
      await api.post(`/reports/${reportId}/${action}`, { notes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reports'])
    },
  })

  const handleResolve = (report) => {
    const notes = prompt('Resolution notes (optional):')
    resolveMutation.mutate({ reportId: report.id, action: 'resolve', notes })
  }

  const handleDismiss = (report) => {
    const notes = prompt('Dismissal reason (optional):')
    resolveMutation.mutate({ reportId: report.id, action: 'dismiss', notes })
  }

  const getReportableInfo = (report) => {
    switch (report.reportable_type) {
      case 'App\\Models\\Post':
        return { type: 'Post', label: 'Post content' }
      case 'App\\Models\\User':
        return { type: 'User', label: `@${report.reportable?.username}` }
      case 'App\\Models\\Message':
        return { type: 'Message', label: 'Message content' }
      default:
        return { type: 'Unknown', label: 'Unknown' }
    }
  }

  const reasonLabels = {
    spam: 'Spam',
    harassment: 'Harassment',
    hate_speech: 'Hate Speech',
    violence: 'Violence',
    nudity: 'Nudity/Sexual Content',
    false_information: 'False Information',
    copyright: 'Copyright Violation',
    impersonation: 'Impersonation',
    self_harm: 'Self-Harm',
    illegal: 'Illegal Activity',
    other: 'Other',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['pending', 'reviewing', 'resolved', 'dismissed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No {filter} reports found
          </div>
        ) : (
          data?.data?.map((report) => {
            const reportableInfo = getReportableInfo(report)
            return (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {reasonLabels[report.reason] || report.reason}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {reportableInfo.type}: {reportableInfo.label}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      report.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : report.status === 'reviewing'
                        ? 'bg-blue-100 text-blue-700'
                        : report.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                {report.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm">{report.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <img
                        src={report.reporter?.avatar_url}
                        alt={report.reporter?.display_name}
                        className="h-6 w-6 rounded-full"
                      />
                      <span>Reported by @{report.reporter?.username}</span>
                    </div>
                    <span>{formatDateTime(report.created_at)}</span>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDismiss(report)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <XCircle className="h-5 w-5" />
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolve(report)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Resolve
                      </button>
                    </div>
                  )}

                  {report.resolution_notes && (
                    <div className="text-sm text-gray-500">
                      Notes: {report.resolution_notes}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {data.meta.last_page}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= data.meta.last_page}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
