import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal, Heart, MessageCircle, Repeat2, Share, Bookmark } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { postService } from '@/services'
import PostCard from '@/components/feed/PostCard'
import { cn } from '@/lib/utils'

const SinglePost = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchComments()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await postService.getPost(postId)
      setPost(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive"
      })
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await postService.getComments(postId)
      setComments(response.data || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      setSubmitting(true)
      const response = await postService.createComment(postId, {
        content: commentText.trim()
      })
      setComments(prev => [response.data, ...prev])
      setCommentText('')
      setPost(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async () => {
    try {
      if (post.is_liked) {
        await postService.unlikePost(postId)
        setPost(prev => ({
          ...prev,
          is_liked: false,
          reactions_count: prev.reactions_count - 1
        }))
      } else {
        await postService.likePost(postId)
        setPost(prev => ({
          ...prev,
          is_liked: true,
          reactions_count: prev.reactions_count + 1
        }))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive"
      })
    }
  }

  const handleBookmark = async () => {
    try {
      if (post.is_bookmarked) {
        await postService.removeBookmark(postId)
        setPost(prev => ({ ...prev, is_bookmarked: false }))
      } else {
        await postService.addBookmark(postId)
        setPost(prev => ({ ...prev, is_bookmarked: true }))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bookmark post",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.user?.username}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.user?.avatar} />
              <AvatarFallback>{post.user?.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <Link to={`/profile/${post.user?.username}`} className="font-semibold hover:underline">
                  {post.user?.display_name}
                </Link>
                <p className="text-sm text-muted-foreground">@{post.user?.username}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                  {post.user?.id === user?.id && (
                    <>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </>
                  )}
                  {post.user?.id !== user?.id && (
                    <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Post Text */}
        <p className="mt-4 text-lg whitespace-pre-wrap">{post.content}</p>

        {/* Post Media */}
        {post.media?.length > 0 && (
          <div className={cn(
            "mt-4 grid gap-2 rounded-xl overflow-hidden",
            post.media.length === 1 && "grid-cols-1",
            post.media.length === 2 && "grid-cols-2",
            post.media.length >= 3 && "grid-cols-2"
          )}>
            {post.media.map((media, index) => (
              <img
                key={media.id || index}
                src={media.url}
                alt=""
                className="w-full h-auto object-cover"
              />
            ))}
          </div>
        )}

        {/* Post Meta */}
        <p className="mt-4 text-sm text-muted-foreground">
          {formatDate(post.created_at)}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 py-4 border-t border-b text-sm">
          <span><strong>{post.reposts_count || 0}</strong> Reposts</span>
          <span><strong>{post.reactions_count || 0}</strong> Likes</span>
          <span><strong>{post.bookmarks_count || 0}</strong> Bookmarks</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Repeat2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLike}>
            <Heart className={cn("h-5 w-5", post.is_liked && "fill-red-500 text-red-500")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleBookmark}>
            <Bookmark className={cn("h-5 w-5", post.is_bookmarked && "fill-current")} />
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Reply Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="p-4 border-b">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Post your reply"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0"
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={!commentText.trim() || submitting}>
                  {submitting ? 'Posting...' : 'Reply'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments */}
      <div>
        {comments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No replies yet</p>
            <p className="text-sm">Be the first to reply!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <PostCard key={comment.id} post={comment} isComment />
          ))
        )}
      </div>
    </div>
  )
}

export default SinglePost
