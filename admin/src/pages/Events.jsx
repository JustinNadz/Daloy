import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { formatDate, formatDateTime } from '../lib/utils'
import {
  Search,
  MoreVertical,
  Calendar,
  MapPin,
  Users,
  Ban,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  XCircle,
} from 'lucide-react'

export default function Events() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionMenuOpen, setActionMenuOpen] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/events', {
        params: { search, status: statusFilter },
      })
      return res.data
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async ({ eventId, reason }) => {
      await api.post(`/events/${eventId}/cancel`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events'])
      closeModal()
    },
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ eventId, reason }) => {
      await api.post(`/events/${eventId}/suspend`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events'])
      closeModal()
    },
  })

  const restoreMutation = useMutation({
    mutationFn: async (eventId) => {
      await api.post(`/events/${eventId}/restore`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async ({ eventId, reason }) => {
      await api.delete(`/events/${eventId}`, { data: { reason } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events'])
      closeModal()
    },
  })

  const openModal = (action, event) => {
    setModalAction(action)
    setSelectedEvent(event)
    setModalOpen(true)
    setReason('')
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalAction(null)
    setSelectedEvent(null)
    setReason('')
  }

  const handleAction = () => {
    if (modalAction === 'cancel') {
      cancelMutation.mutate({ eventId: selectedEvent.id, reason })
    } else if (modalAction === 'suspend') {
      suspendMutation.mutate({ eventId: selectedEvent.id, reason })
    } else if (modalAction === 'delete') {
      deleteMutation.mutate({ eventId: selectedEvent.id, reason })
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      completed: 'bg-gray-50 text-gray-600 border-gray-200',
      suspended: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.active}`}>
        {status}
      </span>
    )
  }

  // Sample data
  const sampleEvents = [
    { id: 1, title: 'Tech Meetup 2024', description: 'Annual tech meetup', location: 'San Francisco, CA', start_date: '2024-03-15T18:00:00', status: 'active', attendees_count: 150, interested_count: 320, user: { username: 'techguru' }, created_at: '2024-01-15' },
    { id: 2, title: 'Startup Pitch Night', description: 'Pitch your startup', location: 'New York, NY', start_date: '2024-03-20T19:00:00', status: 'active', attendees_count: 45, interested_count: 89, user: { username: 'startupfan' }, created_at: '2024-02-01' },
    { id: 3, title: 'Cancelled Event', description: 'This was cancelled', location: 'Online', start_date: '2024-02-28T14:00:00', status: 'cancelled', attendees_count: 0, interested_count: 12, user: { username: 'organizer' }, created_at: '2024-02-10' },
  ]

  const events = data?.data?.length > 0 ? data.data : sampleEvents

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Content</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Events</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-500 mt-1">Manage platform events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
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
            <option value="cancelled">Cancelled</option>
            <option value="suspended">Suspended</option>
            <option value="completed">Completed</option>
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Attendees</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
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
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">No events found</td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">by @{event.user?.username}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateTime(event.start_date)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location || 'TBD'}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users className="h-3.5 w-3.5" />
                        {event.attendees_count} going / {event.interested_count} interested
                      </div>
                    </td>
                    <td className="px-5 py-3">{getStatusBadge(event.status)}</td>
                    <td className="px-5 py-3 text-right relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === event.id ? null : event.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>

                      {actionMenuOpen === event.id && (
                        <div className="absolute right-5 top-12 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                          {(event.status === 'suspended' || event.status === 'cancelled') ? (
                            <button
                              onClick={() => {
                                restoreMutation.mutate(event.id)
                                setActionMenuOpen(null)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  openModal('cancel', event)
                                  setActionMenuOpen(null)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  openModal('suspend', event)
                                  setActionMenuOpen(null)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                              >
                                <Ban className="h-4 w-4" />
                                Suspend
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              openModal('delete', event)
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
              {modalAction === 'cancel' ? 'Cancel Event' : modalAction === 'suspend' ? 'Suspend Event' : 'Delete Event'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to {modalAction} "{selectedEvent?.title}"?
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
                  modalAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : modalAction === 'cancel' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {modalAction === 'cancel' ? 'Cancel Event' : modalAction === 'suspend' ? 'Suspend' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
