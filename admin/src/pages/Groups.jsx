import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import {
  Search,
  MoreVertical,
  Users,
  Lock,
  Globe,
  Trash2,
  Ban,
  RotateCcw,
  UserMinus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

export default function Groups() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState(null)
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-groups', search, statusFilter, visibilityFilter],
    queryFn: async () => {
      const res = await api.get('/groups', {
        params: { search, status: statusFilter, visibility: visibilityFilter },
      })
      return res.data
    },
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ groupId, reason }) => {
      await api.post(`/groups/${groupId}/suspend`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-groups'])
      closeModal()
    },
  })

  const restoreMutation = useMutation({
    mutationFn: async (groupId) => {
      await api.post(`/groups/${groupId}/restore`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-groups'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ groupId, reason }) => {
      await api.delete(`/groups/${groupId}`, { data: { reason } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-groups'])
      closeModal()
    },
  })

  const openModal = (action, group) => {
    setModalAction(action)
    setSelectedGroup(group)
    setModalOpen(true)
    setReason('')
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalAction(null)
    setSelectedGroup(null)
    setReason('')
  }

  const handleAction = () => {
    if (modalAction === 'suspend') {
      suspendMutation.mutate({ groupId: selectedGroup.id, reason })
    } else if (modalAction === 'delete') {
      deleteMutation.mutate({ groupId: selectedGroup.id, reason })
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-50 text-green-700 border-green-200',
      suspended: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      deleted: 'bg-red-50 text-red-700 border-red-200',
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.active}`}>
        {status}
      </span>
    )
  }

  // Sample data
  const sampleGroups = [
    { id: 1, name: 'Tech Enthusiasts', description: 'A group for tech lovers', is_private: false, status: 'active', members_count: 1250, creator: { username: 'techguru' }, created_at: '2024-01-15' },
    { id: 2, name: 'Private Investors', description: 'Investment discussions', is_private: true, status: 'active', members_count: 89, creator: { username: 'investor1' }, created_at: '2024-02-10' },
    { id: 3, name: 'Spam Group', description: 'Suspended for spam', is_private: false, status: 'suspended', members_count: 5, creator: { username: 'spammer' }, created_at: '2024-03-01' },
  ]

  const groups = data?.data?.length > 0 ? data.data : sampleGroups

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Content</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Groups</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        <p className="text-gray-500 mt-1">Manage community groups</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Group</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Visibility</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Members</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">No groups found</td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-500">by @{group.creator?.username}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        {group.is_private ? (
                          <>
                            <Lock className="h-3.5 w-3.5" />
                            Private
                          </>
                        ) : (
                          <>
                            <Globe className="h-3.5 w-3.5" />
                            Public
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users className="h-3.5 w-3.5" />
                        {group.members_count?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-3">{getStatusBadge(group.status || 'active')}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDate(group.created_at)}</td>
                    <td className="px-5 py-3 text-right relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === group.id ? null : group.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>

                      {actionMenuOpen === group.id && (
                        <div className="absolute right-5 top-12 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                          {group.status === 'suspended' ? (
                            <button
                              onClick={() => {
                                restoreMutation.mutate(group.id)
                                setActionMenuOpen(null)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                openModal('suspend', group)
                                setActionMenuOpen(null)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                            >
                              <Ban className="h-4 w-4" />
                              Suspend
                            </button>
                          )}
                          <button
                            onClick={() => {
                              openModal('delete', group)
                              setActionMenuOpen(null)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {modalAction === 'suspend' ? 'Suspend Group' : 'Delete Group'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {modalAction === 'suspend'
                ? `Are you sure you want to suspend "${selectedGroup?.name}"?`
                : `Are you sure you want to permanently delete "${selectedGroup?.name}"?`}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none"
                placeholder="Enter reason..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!reason.trim()}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
                  modalAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {modalAction === 'suspend' ? 'Suspend' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
