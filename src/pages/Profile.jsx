import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, postService } from '@/services'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import PostCard from '@/components/feed/PostCard'
import { CalendarDays, MapPin, Link as LinkIcon, Loader2, ArrowLeft, Settings } from 'lucide-react'

const Profile = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('posts')

  const isOwnProfile = currentUser?.username === username

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => userService.getUser(username),
    enabled: !!username,
  })

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', username, activeTab],
    queryFn: () => postService.getUserPosts(username, activeTab),
    enabled: !!username,
  })

  const followMutation = useMutation({
    mutationFn: (userId) => userService.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', username])
      toast({ title: 'Following', description: `You are now following @${username}` })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: (userId) => userService.unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', username])
      toast({ title: 'Unfollowed', description: `You unfollowed @${username}` })
    },
  })

  const user = profileData?.data?.user
  const posts = postsData?.data?.posts || []

  if (profileLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <p className="text-muted-foreground mb-4">@{username} doesn't exist</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    )
  }

  const handleFollowToggle = () => {
    if (user.is_following) {
      unfollowMutation.mutate(user.id)
    } else {
      followMutation.mutate(user.id)
    }
  }

  return (
    <div className="flex-1 min-w-0 max-w-[600px]">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 px-4 py-3 border-b border-border flex items-center gap-4">
        <Link to="/" className="hover:bg-muted rounded-full p-2 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-lg">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.posts_count || 0} posts</p>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-primary/30 to-primary/10 relative">
        {user.cover_photo && (
          <img src={user.cover_photo} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-border">
        <div className="flex justify-between items-start -mt-16 mb-4">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-4xl">{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="mt-20">
            {isOwnProfile ? (
              <Link to="/settings">
                <Button variant="outline" className="rounded-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit profile
                </Button>
              </Link>
            ) : (
              <Button
                variant={user.is_following ? 'outline' : 'default'}
                className="rounded-full min-w-[100px]"
                onClick={handleFollowToggle}
                disabled={followMutation.isPending || unfollowMutation.isPending}
              >
                {user.is_following ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>

          {user.bio && <p className="text-foreground">{user.bio}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {user.location}
              </span>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <LinkIcon className="w-4 h-4" />
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="flex gap-4">
            <Link to={`/${username}/following`} className="hover:underline">
              <span className="font-bold">{user.following_count || 0}</span>{' '}
              <span className="text-muted-foreground">Following</span>
            </Link>
            <Link to={`/${username}/followers`} className="hover:underline">
              <span className="font-bold">{user.followers_count || 0}</span>{' '}
              <span className="text-muted-foreground">Followers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger
            value="posts"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
          >
            Replies
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
          >
            Media
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
          >
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {postsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No {activeTab} yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile
