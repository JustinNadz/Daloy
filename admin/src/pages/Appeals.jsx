import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  FileText,
  Eye,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

export default function Appeals() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedAppeal, setSelectedAppeal] = useState(null)
  const [response, setResponse] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appeals', search, statusFilter, typeFilter],
    queryFn: async () => {
      const res = await api.get('/appeals', {
        params: { search, status: statusFilter, type: typeFilter },
      })
      return res.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-appeals-stats'],
    queryFn: async () => {
      const res = await api.get('/appeals/stats')
      return res.data.data
    },
  })

  const { data: types } = useQuery({
    queryKey: ['admin-appeals-types'],
    queryFn: async () => {
      const res = await api.get('/appeals/types')
      return res.data.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: async ({ id, response }) => {
      await api.post(`/appeals/${id}/approve`, { response })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appeals'])
      setSelectedAppeal(null)
      setResponse('')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, response }) => {
      await api.post(`/appeals/${id}/reject`, { response })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appeals'])
      setSelectedAppeal(null)
      setResponse('')
    },
  })

  const reviewMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/appeals/${id}/review`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appeals'])
    },
  })

  const handleApprove = () => {
    if (selectedAppeal && response.trim()) {
      approveMutation.mutate({ id: selectedAppeal.id, response })
    } else {
      alert('Please provide a response')
    }
  }

  const handleReject = () => {
    if (selectedAppeal && response.trim()) {
      rejectMutation.mutate({ id: selectedAppeal.id, response })
    } else {
      alert('Please provide a response')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700',
      under_review: 'bg-blue-50 text-blue-700',
      approved: 'bg-green-50 text-green-700',
      rejected: 'bg-red-50 text-red-700',
    }
    return styles[status] || styles.pending
  }

  const appeals = data?.data?.data || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Moderation</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Appeals</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appeals</h1>
        <p className="text-gray-500 mt-1">Handle user appeals for moderation actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats?.pending || 0}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats?.under_review || 0}</p>
              <p className="text-sm text-gray-500">Under Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats?.approved || 0}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats?.rejected || 0}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search appeals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All Types</option>
          {types && Object.entries(types).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appeals List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
            </div>
          ) : appeals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No appeals found
            </div>
          ) : (
            appeals.map((appeal) => (
              <div
                key={appeal.id}
                onClick={() => setSelectedAppeal(appeal)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${
                  selectedAppeal?.id === appeal.id
                    ? 'border-blue-500 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {appeal.user?.avatar_url ? (
                    <img
                      src={appeal.user.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        @{appeal.user?.username}
                      </p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(appeal.status)}`}>
                        {appeal.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {types?.[appeal.appeal_type] || appeal.appeal_type}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {appeal.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">
                      {formatDate(appeal.created_at)}
                    </span>
                    {appeal.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          reviewMutation.mutate(appeal.id)
                        }}
                        className="block mt-2 text-xs text-blue-600 hover:underline"
                      >
                        Mark Under Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Appeal Details */}
        <div className="lg:col-span-1">
          {selectedAppeal ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h3 className="font-medium text-gray-900 mb-4">Appeal Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">User</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedAppeal.user?.avatar_url ? (
                      <img
                        src={selectedAppeal.user.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{selectedAppeal.user?.display_name}</p>
                      <p className="text-xs text-gray-500">@{selectedAppeal.user?.username}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase">Appeal Type</p>
                  <p className="text-sm font-medium">
                    {types?.[selectedAppeal.appeal_type] || selectedAppeal.appeal_type}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase">Reason</p>
                  <p className="text-sm">{selectedAppeal.reason}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase">Explanation</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedAppeal.explanation}</p>
                </div>

                {['pending', 'under_review'].includes(selectedAppeal.status) && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Your Response</p>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Enter your response..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={rejectMutation.isPending}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </>
                )}

                {selectedAppeal.admin_response && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Admin Response</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedAppeal.admin_response}</p>
                    {selectedAppeal.reviewer && (
                      <p className="text-xs text-gray-400 mt-1">
                        By {selectedAppeal.reviewer.name} • {formatDate(selectedAppeal.reviewed_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              Select an appeal to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
