import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import PostComposer from "./PostComposer";
import PostCard from "./PostCard";
import { Loader2 } from "lucide-react";

// Helper function to format time
const formatTime = (dateString) => {
  if (!dateString) return '';
  if (dateString === 'now') return 'now';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Feed = ({ activeTab, onTabChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts based on active tab
  const { data, isLoading, error } = useQuery({
    queryKey: ['feed', activeTab],
    queryFn: () => activeTab === 'following' 
      ? postService.getFeed() 
      : postService.getExplore(),
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData) => postService.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries(['feed']);
      toast({
        title: "Posted!",
        description: "Your post has been shared.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }) => 
      isLiked ? postService.unlikePost(postId) : postService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['feed']);
    },
  });

  // Repost mutation
  const repostMutation = useMutation({
    mutationFn: ({ postId, isReposted }) =>
      isReposted ? postService.undoRepost(postId) : postService.repost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['feed']);
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: ({ postId, isBookmarked }) =>
      isBookmarked ? postService.unbookmarkPost(postId) : postService.bookmarkPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['feed']);
    },
  });

  const handleNewPost = (content, mediaIds = []) => {
    createPostMutation.mutate({ content, media_ids: mediaIds });
  };

  const handleLike = (id, isLiked) => {
    likeMutation.mutate({ postId: id, isLiked });
  };

  const handleRepost = (id, isReposted) => {
    repostMutation.mutate({ postId: id, isReposted });
  };

  const handleBookmark = (id, isBookmarked) => {
    bookmarkMutation.mutate({ postId: id, isBookmarked });
  };

  const posts = data?.data?.posts || data?.data?.data || [];

  return (
    <div className="flex-1 min-w-0 max-w-[600px] py-3">
      {/* Tabs */}
      <div className="bg-card rounded-2xl mb-4 overflow-hidden">
        <div className="flex">
          <button
            className={`flex-1 py-4 text-sm font-medium transition-all duration-200 relative ${activeTab === "foryou"
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            onClick={() => onTabChange("foryou")}
          >
            For You
            {activeTab === "foryou" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
            )}
          </button>
          <button
            className={`flex-1 py-4 text-sm font-medium transition-all duration-200 relative ${activeTab === "following"
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            onClick={() => onTabChange("following")}
          >
            Following
            {activeTab === "following" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Composer */}
      <PostComposer onPost={handleNewPost} isLoading={createPostMutation.isPending} />

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-2xl p-4 mb-4 text-center">
          <p>Failed to load posts. Please try again.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && posts.length === 0 && (
        <div className="bg-card rounded-2xl p-8 text-center">
          <p className="text-muted-foreground mb-2">No posts yet</p>
          <p className="text-sm text-muted-foreground">
            {activeTab === "following"
              ? "Follow some people to see their posts here!"
              : "Be the first to post something!"}
          </p>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-0">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            author={{
              name: post.user?.name || post.author?.name,
              handle: `@${post.user?.username || post.author?.handle?.replace('@', '')}`,
              avatar: post.user?.avatar || post.author?.avatar,
            }}
            time={formatTime(post.created_at || post.time)}
            content={post.content}
            image={post.media?.[0]?.url || post.image}
            stats={{
              likes: post.reactions_count || post.stats?.likes || 0,
              comments: post.comments_count || post.stats?.comments || 0,
              reposts: post.reposts_count || post.stats?.reposts || 0,
            }}
            isLiked={post.is_liked || false}
            isReposted={post.is_reposted || false}
            isBookmarked={post.is_bookmarked || false}
            onLike={handleLike}
            onRepost={handleRepost}
            onBookmark={handleBookmark}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;
