import { Home, Search, Bell, Mail, Users, User, Settings, Feather } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Home", id: "home", path: "/" },
  { icon: Search, label: "Search", id: "search", path: "/search" },
  { icon: Bell, label: "Notifications", id: "notifications", path: "/notifications" },
  { icon: Mail, label: "Messages", id: "messages", path: "/messages" },
  { icon: Users, label: "Groups", id: "groups", path: "/groups" },
  { icon: User, label: "Profile", id: "profile", path: "/profile" },
  { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
];

const Sidebar = ({ onPost }) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-[260px] h-screen sticky top-0 flex flex-col p-4 shrink-0">
      <div className="bg-card rounded-2xl flex-1 flex flex-col p-4">
        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/profile' && location.pathname.includes('/profile'));
            return (
              <Link
                key={item.id}
                to={item.path}
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
              </Link>
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
        <Link to="/profile" className="flex items-center gap-3 p-3 rounded-full hover:bg-muted transition-colors cursor-pointer group">
          <Avatar className="w-10 h-10 shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>{user?.display_name?.substring(0, 2)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{user?.display_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">@{user?.username || 'username'}</p>
          </div>
          <span className="text-muted-foreground shrink-0 group-hover:text-foreground transition-colors">⋮</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
