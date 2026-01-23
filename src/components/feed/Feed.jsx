import { useState } from "react";
import PostComposer from "./PostComposer";
import PostCard from "./PostCard";

const initialPosts = [
  {
    id: "1",
    author: {
      name: "Elena Cruz",
      handle: "@elena_cruz",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
    time: "2h",
    content: "Just arrived in Siargao! The waves are incredible today. Can't wait to hit the surf 🌊 #IslandLife",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=400&fit=crop",
    stats: { likes: 245, comments: 32, reposts: 12 },
  },
  {
    id: "2",
    author: {
      name: "Tech Daily",
      handle: "@techdaily",
      avatar: "https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=100&h=100&fit=crop",
    },
    time: "5h",
    content: "The new framework updates are mind-blowing. The performance gains we're seeing in production are over 40%. Huge props to the open source community! ⚡🎵",
    stats: { likes: 1200, comments: 89, reposts: 450 },
  },
  {
    id: "3",
    author: {
      name: "Music Vibes",
      handle: "@musicvibes",
      avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    },
    time: "8h",
    content: "Current mood: Late night coding sessions with lo-fi beats. 🎧🌙",
    musicCard: {
      title: "Midnight Lo-Fi Stream",
      artist: "ChillHop Records",
    },
    stats: { likes: 89, comments: 12, reposts: 4, shares: 4 },
  },
];

const Feed = ({ activeTab, onTabChange }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [repostedPosts, setRepostedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());

  const handleNewPost = (content) => {
    const newPost = {
      id: Date.now().toString(),
      author: {
        name: "Marcus Chen",
        handle: "@marcus_flow",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      time: "now",
      content,
      stats: { likes: 0, comments: 0, reposts: 0 },
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (id) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRepost = (id) => {
    setRepostedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBookmark = (id) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const displayPosts = activeTab === "following"
    ? posts.filter((_, i) => i % 2 === 0)
    : posts;

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
      <PostComposer onPost={handleNewPost} />

      {/* Posts */}
      <div className="space-y-0">
        {displayPosts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            isLiked={likedPosts.has(post.id)}
            isReposted={repostedPosts.has(post.id)}
            isBookmarked={bookmarkedPosts.has(post.id)}
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
