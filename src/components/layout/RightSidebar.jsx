import { useState } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const trendingTopics = [
  { category: "Technology", tag: "#TechSummit2024", posts: "24.1K posts" },
  { category: "Music", tag: "OPM Music", posts: "12.1K posts" },
  { category: "Lifestyle", tag: "#WeekendVibes", posts: "8K posts" },
];

const initialSuggestedUsers = [
  {
    id: "1",
    name: "DesignGuild",
    handle: "@designguild",
    avatar: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
    isFollowing: false,
  },
  {
    id: "2",
    name: "Travel PH",
    handle: "@travelph",
    avatar: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=100&h=100&fit=crop",
    isFollowing: false,
  },
];

const RightSidebar = ({ searchQuery, onSearchChange }) => {
  const [suggestedUsers, setSuggestedUsers] = useState(initialSuggestedUsers);
  const { toast } = useToast();

  const handleFollow = (id) => {
    setSuggestedUsers(prev => prev.map(user => {
      if (user.id === id) {
        const newFollowState = !user.isFollowing;
        toast({
          title: newFollowState ? "Following!" : "Unfollowed",
          description: newFollowState ? `You are now following ${user.name}` : `You unfollowed ${user.name}`,
        });
        return { ...user, isFollowing: newFollowState };
      }
      return user;
    }));
  };

  const handleTrendingClick = (tag) => {
    onSearchChange(tag);
    toast({
      title: "Searching...",
      description: `Showing results for ${tag}`,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search",
        description: `Searching for "${searchQuery}"`,
      });
    }
  };

  return (
    <aside className="w-[320px] h-screen sticky top-0 p-4 space-y-4 shrink-0">
      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="bg-card rounded-full px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search Daloy"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
          />
        </div>
      </form>

      {/* Trending Waves */}
      <div className="bg-card rounded-2xl p-4">
        <h2 className="font-bold text-lg text-foreground mb-4">Trending Waves</h2>
        <div className="space-y-1">
          {trendingTopics.map((topic, index) => (
            <div 
              key={index} 
              className="cursor-pointer hover:bg-muted rounded-lg p-3 -mx-2 transition-all duration-200 hover:scale-[1.01]"
              onClick={() => handleTrendingClick(topic.tag)}
            >
              <p className="text-xs text-muted-foreground">{topic.category}</p>
              <p className="font-semibold text-sm text-foreground hover:text-primary transition-colors">{topic.tag}</p>
              <p className="text-xs text-muted-foreground">{topic.posts}</p>
            </div>
          ))}
        </div>
        <button className="text-primary text-sm font-medium mt-3 hover:underline transition-all">
          Show more
        </button>
      </div>

      {/* Suggested Flows */}
      <div className="bg-card rounded-2xl p-4">
        <h2 className="font-bold text-lg text-foreground mb-4">Suggested Flows</h2>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 group">
              <Avatar className="w-10 h-10 shrink-0 ring-2 ring-transparent group-hover:ring-primary/10 transition-all cursor-pointer">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 cursor-pointer">
                <p className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.handle}</p>
              </div>
              <Button 
                variant={user.isFollowing ? "outline" : "follow"} 
                size="sm" 
                className={`shrink-0 transition-all hover:scale-105 ${user.isFollowing ? 'border-primary text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive' : ''}`}
                onClick={() => handleFollow(user.id)}
              >
                {user.isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          ))}
        </div>
        <button className="text-primary text-sm font-medium mt-3 hover:underline transition-all">
          Show more
        </button>
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground px-2 space-x-1">
        <span className="hover:underline cursor-pointer hover:text-foreground transition-colors">Terms</span>
        <span>·</span>
        <span className="hover:underline cursor-pointer hover:text-foreground transition-colors">Privacy</span>
        <span>·</span>
        <span className="hover:underline cursor-pointer hover:text-foreground transition-colors">Cookies</span>
        <span>·</span>
        <span>© 2024 Daloy Inc</span>
      </div>
    </aside>
  );
};

export default RightSidebar;
