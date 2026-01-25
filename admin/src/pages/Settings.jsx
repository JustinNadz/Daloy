import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { Save } from 'lucide-react'

export default function Settings() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('general')

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await api.get('/settings')
      return res.data.data
    },
  })

  const [formData, setFormData] = useState({})

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await api.put('/settings', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-settings'])
      alert('Settings saved successfully!')
    },
  })

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'content', label: 'Content' },
    { id: 'security', label: 'Security' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Save className="h-5 w-5" />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                defaultValue={settings?.site_name || 'Daloy'}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                rows={3}
                defaultValue={settings?.site_description || ''}
                onChange={(e) => handleChange('site_description', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue={settings?.support_email || ''}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="maintenance_mode"
                defaultChecked={settings?.maintenance_mode || false}
                onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                className="h-4 w-4 text-primary rounded"
              />
              <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-700">
                Maintenance Mode
              </label>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Post Length
              </label>
              <input
                type="number"
                defaultValue={settings?.max_post_length || 500}
                onChange={(e) => handleChange('max_post_length', parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Media per Post
              </label>
              <input
                type="number"
                defaultValue={settings?.max_media_per_post || 4}
                onChange={(e) => handleChange('max_media_per_post', parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max File Size (MB)
              </label>
              <input
                type="number"
                defaultValue={settings?.max_file_size_mb || 50}
                onChange={(e) => handleChange('max_file_size_mb', parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allow_adult_content"
                defaultChecked={settings?.allow_adult_content || false}
                onChange={(e) => handleChange('allow_adult_content', e.target.checked)}
                className="h-4 w-4 text-primary rounded"
              />
              <label htmlFor="allow_adult_content" className="text-sm font-medium text-gray-700">
                Allow Adult Content (NSFW)
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="registration_enabled"
                defaultChecked={settings?.registration_enabled !== false}
                onChange={(e) => handleChange('registration_enabled', e.target.checked)}
                className="h-4 w-4 text-primary rounded"
              />
              <label htmlFor="registration_enabled" className="text-sm font-medium text-gray-700">
                Allow New Registrations
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="email_verification_required"
                defaultChecked={settings?.email_verification_required || false}
                onChange={(e) => handleChange('email_verification_required', e.target.checked)}
                className="h-4 w-4 text-primary rounded"
              />
              <label htmlFor="email_verification_required" className="text-sm font-medium text-gray-700">
                Require Email Verification
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                defaultValue={settings?.min_password_length || 8}
                onChange={(e) => handleChange('min_password_length', parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                defaultValue={settings?.max_login_attempts || 5}
                onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
