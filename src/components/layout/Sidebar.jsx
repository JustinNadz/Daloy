import { Home, Search, Bell, Mail, Users, User, Settings, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { icon: Home, label: "Home", id: "home" },
  { icon: Search, label: "Search", id: "search" },
  { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: Mail, label: "Messages", id: "messages" },
  { icon: Users, label: "Groups", id: "groups" },
  { icon: User, label: "Profile", id: "profile" },
  { icon: Settings, label: "Settings", id: "settings" },
];

const Sidebar = ({ activeNav, onNavChange, onPost }) => {
  return (
    <aside className="w-[260px] h-screen sticky top-0 flex flex-col p-4 shrink-0">
      <div className="bg-card rounded-2xl flex-1 flex flex-col p-4">
        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-full text-left
                  transition-all duration-200 hover:scale-[1.01]
                  ${isActive
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-[15px]">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Post Button */}
        <Button
          variant="post"
          size="post"
          className="mb-4 mt-6 hover:scale-[1.02] transition-transform active:scale-95"
          onClick={onPost}
        >
          <Feather className="w-5 h-5" />
          Post
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-full hover:bg-muted transition-colors cursor-pointer group">
          <Avatar className="w-10 h-10 shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback>MC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">Marcus Chen</p>
            <p className="text-xs text-muted-foreground truncate">@marcus_flow</p>
          </div>
          <span className="text-muted-foreground shrink-0 group-hover:text-foreground transition-colors">⋮</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
