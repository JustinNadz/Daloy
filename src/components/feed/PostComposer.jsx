import { useState } from "react";
import { Image, Link, ListTodo, Smile, Clock, MapPin, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PostComposer = ({ onPost }) => {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { toast } = useToast();

  const handlePost = () => {
    if (content.trim()) {
      onPost(content);
      setContent("");
      setSelectedImage(null);
      toast({
        title: "Posted!",
        description: "Your flow has been shared with the world.",
      });
    }
  };

  const handleImageClick = () => {
    const sampleImages = [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=400&fit=crop",
    ];
    setSelectedImage(sampleImages[Math.floor(Math.random() * sampleImages.length)]);
    toast({
      title: "Image added",
      description: "Your image is ready to post!",
    });
  };

  const handleEmojiClick = () => {
    const emojis = ["🔥", "💯", "✨", "🚀", "💡", "🎉", "❤️", "👏"];
    setContent(prev => prev + emojis[Math.floor(Math.random() * emojis.length)]);
  };

  const handleIconClick = (action) => {
    toast({
      title: `${action} clicked`,
      description: `${action} feature coming soon!`,
    });
  };

  return (
    <div className={`bg-card rounded-2xl p-4 mb-4 transition-all duration-200 ${isFocused ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" />
          <AvatarFallback>MC</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What's flowing in your mind?"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm py-2 resize-none min-h-[60px]"
            rows={2}
          />
          
          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="relative mt-2 rounded-xl overflow-hidden">
              <img src={selectedImage} alt="Selected" className="w-full h-32 object-cover" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border gap-2">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-accent h-8 w-8 hover:scale-110 transition-transform"
                onClick={handleImageClick}
              >
                <Image className="w-[18px] h-[18px]" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-accent h-8 w-8 hover:scale-110 transition-transform"
                onClick={() => handleIconClick("GIF")}
              >
                <span className="text-[10px] font-bold border border-primary rounded px-1">GIF</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-accent h-8 w-8 hover:scale-110 transition-transform"
                onClick={() => handleIconClick("Link")}
              >
                <Link className="w-[18px] h-[18px]" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-accent h-8 w-8 hover:scale-110 transition-transform"
                onClick={() => handleIconClick("Poll")}
              >
                <ListTodo className="w-[18px] h-[18px]" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-accent h-8 w-8 hover:scale-110 transition-transform"
                onClick={handleEmojiClick}
              >
                <Smile className="w-[18px] h-[18px]" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-accent h-8 w-8 hover:scale-110 transition-transform"
                onClick={() => handleIconClick("Schedule")}
              >
                <Clock className="w-[18px] h-[18px]" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-accent h-8 w-8 hover:scale-110 transition-transform"
                onClick={() => handleIconClick("Location")}
              >
                <MapPin className="w-[18px] h-[18px]" />
              </Button>
            </div>
            <Button 
              variant="post" 
              size="sm" 
              className={`rounded-full px-6 h-9 shrink-0 transition-all ${content.trim() ? 'opacity-100 hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
              onClick={handlePost}
              disabled={!content.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
