import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  User,
  ExternalLink,
  BadgeCheck,
  Clock,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

export default function Verifications() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [notes, setNotes] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-verifications', search, statusFilter, categoryFilter],
    queryFn: async () => {
      const res = await api.get('/verifications', {
        params: { search, status: statusFilter, category: categoryFilter },
      })
      return res.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-verifications-stats'],
    queryFn: async () => {
      const res = await api.get('/verifications/stats')
      return res.data.data
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['admin-verifications-categories'],
    queryFn: async () => {
      const res = await api.get('/verifications/categories')
      return res.data.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      await api.post(`/verifications/${id}/approve`, { notes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-verifications'])
      setSelectedRequest(null)
      setNotes('')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }) => {
      await api.post(`/verifications/${id}/reject`, { notes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-verifications'])
      setSelectedRequest(null)
      setNotes('')
    },
  })

  const handleApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate({ id: selectedRequest.id, notes })
    }
  }

  const handleReject = () => {
    if (selectedRequest && notes.trim()) {
      rejectMutation.mutate({ id: selectedRequest.id, notes })
    } else {
      alert('Please provide a reason for rejection')
    }
  }

  const requests = data?.data?.data || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>User Management</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Verifications</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Requests</h1>
        <p className="text-gray-500 mt-1">Review user verification requests</p>
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
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats?.total || 0}</p>
              <p className="text-sm text-gray-500">Total</p>
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
            placeholder="Search requests..."
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
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All Categories</option>
          {categories && Object.entries(categories).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No verification requests found
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${
                  selectedRequest?.id === request.id
                    ? 'border-blue-500 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {request.user?.avatar_url ? (
                    <img
                      src={request.user.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{request.full_name}</p>
                      {request.user?.is_verified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">@{request.user?.username}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                        {categories?.[request.category] || request.category}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        request.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700'
                          : request.status === 'approved'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(request.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Request Details */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h3 className="font-medium text-gray-900 mb-4">Request Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Full Name</p>
                  <p className="text-sm font-medium">{selectedRequest.full_name}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase">Category</p>
                  <p className="text-sm font-medium">
                    {categories?.[selectedRequest.category] || selectedRequest.category}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase">Reason</p>
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
                
                {selectedRequest.website_url && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Website</p>
                    <a
                      href={selectedRequest.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {selectedRequest.website_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                
                {selectedRequest.documents?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Documents</p>
                    <div className="space-y-2">
                      {selectedRequest.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline"
                        >
                          Document {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Admin Notes</p>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes (required for rejection)..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        rows={3}
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

                {selectedRequest.status !== 'pending' && selectedRequest.admin_notes && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Admin Notes</p>
                    <p className="text-sm">{selectedRequest.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              Select a request to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
