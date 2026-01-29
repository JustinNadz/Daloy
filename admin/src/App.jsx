import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Groups from './pages/Groups'
import Events from './pages/Events'
import Posts from './pages/Posts'
import Reports from './pages/Reports'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import Admins from './pages/Admins'
import Comments from './pages/Comments'
import Hashtags from './pages/Hashtags'
import Media from './pages/Media'
import Announcements from './pages/Announcements'
import Verifications from './pages/Verifications'
import Appeals from './pages/Appeals'
import System from './pages/System'

function ProtectedRoute({ children }) {
  const { admin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<Users />} />
        <Route path="admins" element={<Admins />} />
        <Route path="groups" element={<Groups />} />
        <Route path="events" element={<Events />} />
        <Route path="posts" element={<Posts />} />
        <Route path="comments" element={<Comments />} />
        <Route path="hashtags" element={<Hashtags />} />
        <Route path="media" element={<Media />} />
        <Route path="reports" element={<Reports />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="verifications" element={<Verifications />} />
        <Route path="appeals" element={<Appeals />} />
        <Route path="logs" element={<Logs />} />
        <Route path="system" element={<System />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
