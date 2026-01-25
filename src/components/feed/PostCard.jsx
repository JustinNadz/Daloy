import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Repeat2, Share, Play, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
};

const PostCard = ({ 
  id, 
  author, 
  time, 
  content, 
  image, 
  musicCard, 
  stats, 
  isLiked = false,
  isReposted = false,
  isBookmarked = false,
  onLike,
  onRepost,
  onBookmark
}) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleComment = () => {
    toast({
      title: "Comments",
      description: "Comment section coming soon!",
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/post/${id}`);
    toast({
      title: "Shared!",
      description: "Link copied to clipboard!",
    });
  };

  const handlePlayMusic = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Paused" : "Now Playing",
      description: musicCard?.title || "Music",
    });
  };

  const username = author.handle?.replace('@', '') || author.username;

  return (
    <article className="bg-card rounded-2xl p-4 mb-4 hover:bg-post-hover transition-all duration-200 cursor-pointer group">
      <div className="flex gap-3">
        <Link to={`/${username}`}>
          <Avatar className="w-10 h-10 shrink-0 ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
            <AvatarImage src={author.avatar} />
            <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/${username}`} className="font-semibold text-sm text-foreground hover:underline">
              {author.name}
            </Link>
            <Link to={`/${username}`} className="text-muted-foreground text-sm hover:underline">
              {author.handle}
            </Link>
            <span className="text-muted-foreground text-sm">· {time}</span>
          </div>

          {/* Content */}
          <p className="text-sm text-foreground mb-3 whitespace-pre-wrap leading-relaxed">
            {content.split(/(#\w+)/g).map((part, i) => {
              if (part.startsWith("#")) {
                return (
                  <span key={i} className="text-hashtag hover:underline cursor-pointer font-medium">
                    {part}
                  </span>
                );
              }
              return part;
            })}
          </p>

          {/* Image */}
          {image && (
            <div className="rounded-xl overflow-hidden mb-3 hover:opacity-95 transition-opacity">
              <img
                src={image}
                alt="Post content"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Music Card */}
          {musicCard && (
            <div 
              className="bg-gradient-to-r from-music-card to-music-card-light rounded-xl p-4 mb-3 flex items-center gap-4 hover:opacity-95 transition-opacity cursor-pointer"
              onClick={handlePlayMusic}
            >
              <button className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all ${isPlaying ? 'scale-95' : ''}`}>
                <Play className={`w-6 h-6 text-white ${isPlaying ? '' : 'fill-white'}`} />
              </button>
              <div>
                <p className="font-semibold text-white text-sm">{musicCard.title}</p>
                <p className="text-white/70 text-xs">{musicCard.artist}</p>
              </div>
            </div>
          )}

          {/* Engagement */}
          <div className="flex items-center justify-between text-engagement">
            <button 
              className={`flex items-center gap-2 transition-all duration-200 group/btn hover:scale-105 ${isLiked ? 'text-destructive' : 'hover:text-destructive'}`}
              onClick={() => onLike && onLike(id, isLiked)}
            >
              <Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-destructive scale-110' : 'group-hover/btn:scale-110'}`} />
              <span className="text-sm">{formatNumber(stats?.likes || 0)}</span>
            </button>
            <button 
              className="flex items-center gap-2 hover:text-primary transition-all duration-200 group/btn hover:scale-105"
              onClick={handleComment}
            >
              <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="text-sm">{formatNumber(stats?.comments || 0)}</span>
            </button>
            <button 
              className={`flex items-center gap-2 transition-all duration-200 group/btn hover:scale-105 ${isReposted ? 'text-green-500' : 'hover:text-green-500'}`}
              onClick={() => onRepost && onRepost(id, isReposted)}
            >
              <Repeat2 className={`w-4 h-4 transition-all ${isReposted ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
              <span className="text-sm">{formatNumber(stats?.reposts || 0)}</span>
            </button>
            <button 
              className="flex items-center gap-2 hover:text-primary transition-all duration-200 group/btn hover:scale-105"
              onClick={handleShare}
            >
              <Share className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              {stats?.shares !== undefined && <span className="text-sm">{formatNumber(stats.shares)}</span>}
            </button>
            <button 
              className={`flex items-center gap-2 transition-all duration-200 group/btn hover:scale-105 ${isBookmarked ? 'text-primary' : 'hover:text-primary'}`}
              onClick={() => onBookmark && onBookmark(id, isBookmarked)}
            >
              <Bookmark className={`w-4 h-4 transition-all ${isBookmarked ? 'fill-primary scale-110' : 'group-hover/btn:scale-110'}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
