import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, TrendingUp, Users, Hash, FileText, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common'
import { useToast } from '@/hooks/use-toast'
import { searchService, userService } from '@/services'
import PostCard from '@/components/feed/PostCard'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('top')
  const [results, setResults] = useState({
    posts: [],
    users: [],
    hashtags: []
  })
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    fetchTrending()
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      handleSearch(q)
    }
  }, [searchParams])

  const fetchTrending = async () => {
    try {
      const response = await searchService.getTrending()
      setTrending(response.data || [])
    } catch (error) {
      console.error('Failed to fetch trending:', error)
    }
  }

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      setSearched(true)
      setSearchParams({ q: searchQuery })

      const [postsRes, usersRes, hashtagsRes] = await Promise.all([
        searchService.searchPosts(searchQuery),
        searchService.searchUsers(searchQuery),
        searchService.searchHashtags(searchQuery)
      ])

      setResults({
        posts: postsRes.data || [],
        users: usersRes.data || [],
        hashtags: hashtagsRes.data || []
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Search failed. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSearched(false)
    setResults({ posts: [], users: [], hashtags: [] })
    setSearchParams({})
  }

  const handleFollow = async (userId) => {
    try {
      await userService.followUser(userId)
      setResults(prev => ({
        ...prev,
        users: prev.users.map(u => 
          u.id === userId ? { ...u, is_following: true } : u
        )
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 p-4 border-b">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search posts, users, or hashtags..."
            className="pl-10 pr-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!searched ? (
        /* Trending Section */
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Trending</h2>
          </div>
          
          {trending.length === 0 ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {trending.map((item, index) => (
                <Link
                  key={item.hashtag || index}
                  to={`/search?q=${encodeURIComponent(item.hashtag || item.name)}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">#{item.hashtag || item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.posts_count?.toLocaleString() || 0} posts
                    </p>
                  </div>
                  <Badge variant="secondary">{index + 1}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Search Results */
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger 
              value="top"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Top
            </TabsTrigger>
            <TabsTrigger 
              value="posts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              People
            </TabsTrigger>
            <TabsTrigger 
              value="hashtags"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Hashtags
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-12rem)]">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="top" className="m-0">
                  {results.users.length === 0 && results.posts.length === 0 ? (
                    <EmptyState
                      icon={SearchIcon}
                      title="No results found"
                      description={`No results for "${query}". Try a different search term.`}
                    />
                  ) : (
                    <div>
                      {results.users.slice(0, 3).length > 0 && (
                        <div className="p-4 border-b">
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" /> People
                          </h3>
                          <div className="space-y-3">
                            {results.users.slice(0, 3).map(user => (
                              <UserResult key={user.id} user={user} onFollow={handleFollow} />
                            ))}
                          </div>
                        </div>
                      )}
                      {results.posts.map(post => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="posts" className="m-0">
                  {results.posts.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="No posts found"
                      description="Try a different search term"
                    />
                  ) : (
                    results.posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="users" className="m-0 p-4">
                  {results.users.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No people found"
                      description="Try a different search term"
                    />
                  ) : (
                    <div className="space-y-3">
                      {results.users.map(user => (
                        <UserResult key={user.id} user={user} onFollow={handleFollow} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="hashtags" className="m-0 p-4">
                  {results.hashtags.length === 0 ? (
                    <EmptyState
                      icon={Hash}
                      title="No hashtags found"
                      description="Try a different search term"
                    />
                  ) : (
                    <div className="space-y-1">
                      {results.hashtags.map(hashtag => (
                        <Link
                          key={hashtag.id}
                          to={`/search?q=${encodeURIComponent('#' + hashtag.name)}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div>
                            <p className="font-medium">#{hashtag.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {hashtag.posts_count?.toLocaleString() || 0} posts
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </ScrollArea>
        </Tabs>
      )}
    </div>
  )
}

const UserResult = ({ user, onFollow }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
    <Link to={`/profile/${user.username}`} className="flex items-center gap-3 flex-1">
      <Avatar>
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.display_name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-1">
          <p className="font-medium">{user.display_name}</p>
          {user.is_verified && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">✓</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        {user.bio && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{user.bio}</p>
        )}
      </div>
    </Link>
    {!user.is_following && (
      <Button size="sm" onClick={() => onFollow(user.id)}>
        Follow
      </Button>
    )}
  </div>
)

export default Search
