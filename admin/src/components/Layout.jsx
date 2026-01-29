import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import {
  LayoutDashboard,
  Users,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  UsersRound,
  Search,
  Mail,
  HelpCircle,
  CheckCircle,
  FileText,
  MessageSquare,
  Hash,
  Image,
  Megaphone,
  BadgeCheck,
  Gavel,
  ScrollText,
  Server,
  UserCog,
  Calendar,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navSections = [
  {
    title: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    title: 'User Management',
    items: [
      { to: '/users', icon: Users, label: 'Users' },
      { to: '/admins', icon: UserCog, label: 'Admins' },
      { to: '/verifications', icon: BadgeCheck, label: 'Verifications' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/posts', icon: FileText, label: 'Posts' },
      { to: '/comments', icon: MessageSquare, label: 'Comments' },
      { to: '/groups', icon: UsersRound, label: 'Groups' },
      { to: '/events', icon: Calendar, label: 'Events' },
      { to: '/hashtags', icon: Hash, label: 'Hashtags' },
      { to: '/media', icon: Image, label: 'Media Library' },
    ],
  },
  {
    title: 'Moderation',
    items: [
      { to: '/reports', icon: Shield, label: 'Reports' },
      { to: '/appeals', icon: Gavel, label: 'Appeals' },
      { to: '/announcements', icon: Megaphone, label: 'Announcements' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/logs', icon: ScrollText, label: 'Activity Logs' },
      { to: '/system', icon: Server, label: 'System' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function Layout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({})
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-[220px] bg-gradient-to-b from-blue-600 to-blue-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">D</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Daloy Admin</p>
            <p className="text-blue-200 text-[10px]">Management Portal</p>
          </div>
          {/* Close button for mobile */}
          <button
            className="ml-auto lg:hidden p-1.5 text-white/70 hover:text-white rounded-md transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-[10px] font-semibold text-blue-200 uppercase tracking-wider hover:text-white transition-colors"
              >
                <span>{section.title}</span>
                {collapsedSections[section.title] ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {!collapsedSections[section.title] && (
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm',
                          isActive
                            ? 'bg-white text-blue-600 font-medium'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        )
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>


      </aside>

      {/* Main content */}
      <div className="lg:ml-[220px] flex-1 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4 lg:mx-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, posts, reports..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Mail className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-400 transition-transform hidden sm:block",
                  profileDropdownOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-40">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{admin?.name || 'Admin'}</p>
                      <p className="text-xs text-gray-500">{admin?.email || 'admin@daloy.com'}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          navigate('/settings')
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        Account Settings
                      </button>
                      <button
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                        Help & Support
                      </button>
                    </div>
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          handleLogout()
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
