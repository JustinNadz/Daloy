import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Image, 
  Smile, 
  Search,
  Plus,
  Check,
  CheckCheck
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { messageService } from '@/services'
import { cn } from '@/lib/utils'

const Messages = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const messagesEndRef = useRef(null)
  
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await messageService.getConversations()
      setConversations(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (id) => {
    try {
      const response = await messageService.getMessages(id)
      setMessages(response.data || [])
      setActiveConversation(conversations.find(c => c.id === parseInt(id)))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId) return

    try {
      setSending(true)
      const response = await messageService.sendMessage(conversationId, {
        content: newMessage.trim()
      })
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const handleSelectConversation = (conversation) => {
    navigate(`/messages/${conversation.id}`)
    setActiveConversation(conversation)
  }

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants?.find(p => p.id !== user?.id)
    return otherUser?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getOtherParticipant = (conversation) => {
    return conversation?.participants?.find(p => p.id !== user?.id)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Conversations List */}
      <div className={cn(
        "w-full md:w-80 border-r flex flex-col",
        conversationId && "hidden md:flex"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No conversations yet</p>
              <p className="text-sm">Start a new conversation!</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation)
              const isActive = conversationId === String(conversation.id)
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-accent transition-colors",
                    isActive && "bg-accent"
                  )}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <Avatar>
                    <AvatarImage src={otherUser?.avatar} />
                    <AvatarFallback>
                      {otherUser?.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{otherUser?.display_name}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.last_message?.created_at || conversation.updated_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                  {conversation.unread_count > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        !conversationId && "hidden md:flex"
      )}>
        {conversationId ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => navigate('/messages')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src={getOtherParticipant(activeConversation)?.avatar} />
                <AvatarFallback>
                  {getOtherParticipant(activeConversation)?.display_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">
                  {getOtherParticipant(activeConversation)?.display_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{getOtherParticipant(activeConversation)?.username}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          isOwn ? "justify-end" : "justify-start"
                        )}>
                          <span className="text-[10px] opacity-70">
                            {formatTime(message.created_at)}
                          </span>
                          {isOwn && (
                            message.read_at ? (
                              <CheckCheck className="h-3 w-3 opacity-70" />
                            ) : (
                              <Check className="h-3 w-3 opacity-70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Image className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
