import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Repeat2, 
  UserPlus, 
  AtSign,
  Settings,
  Check,
  Trash2
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common'
import { useToast } from '@/hooks/use-toast'
import { notificationService } from '@/services'
import { cn } from '@/lib/utils'

const NotificationIcon = ({ type }) => {
  const icons = {
    like: <Heart className="h-4 w-4 text-red-500" />,
    comment: <MessageCircle className="h-4 w-4 text-blue-500" />,
    repost: <Repeat2 className="h-4 w-4 text-green-500" />,
    follow: <UserPlus className="h-4 w-4 text-purple-500" />,
    mention: <AtSign className="h-4 w-4 text-orange-500" />,
  }
  return icons[type] || <Bell className="h-4 w-4" />
}

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 hover:bg-accent transition-colors cursor-pointer border-b",
        !notification.read_at && "bg-primary/5"
      )}
      onClick={() => !notification.read_at && onMarkRead(notification.id)}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={notification.actor?.avatar} />
          <AvatarFallback>
            {notification.actor?.display_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
          <NotificationIcon type={notification.type} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <Link to={`/profile/${notification.actor?.username}`} className="font-semibold hover:underline">
            {notification.actor?.display_name}
          </Link>
          {' '}
          <span className="text-muted-foreground">
            {notification.type === 'like' && 'liked your post'}
            {notification.type === 'comment' && 'commented on your post'}
            {notification.type === 'repost' && 'reposted your post'}
            {notification.type === 'follow' && 'started following you'}
            {notification.type === 'mention' && 'mentioned you in a post'}
          </span>
        </p>
        {notification.post && (
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {notification.post.content}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(notification.created_at)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {!notification.read_at && (
          <div className="h-2 w-2 rounded-full bg-primary" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const Notifications = () => {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getNotifications()
      setNotifications(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      )
      toast({
        title: "Success",
        description: "All notifications marked as read"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      })
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !n.read_at
    return n.type === activeTab
  })

  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="unread"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Unread
            </TabsTrigger>
            <TabsTrigger 
              value="mention"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Mentions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[calc(100vh-12rem)]">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description={
              activeTab === 'unread'
                ? "You're all caught up!"
                : "When someone interacts with your posts, you'll see it here"
            }
          />
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default Notifications
