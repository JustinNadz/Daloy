import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Feed from "@/components/feed/Feed";
import RightSidebar from "@/components/layout/RightSidebar";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeNav, setActiveNav] = useState("home");
  const [activeTab, setActiveTab] = useState("foryou");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleNavChange = (id) => {
    setActiveNav(id);
    toast({
      title: `${id.charAt(0).toUpperCase() + id.slice(1)}`,
      description: `Navigated to ${id} page`,
    });
  };

  const handlePost = () => {
    // Scroll to composer or focus it
    const composer = document.querySelector('textarea');
    if (composer) {
      composer.scrollIntoView({ behavior: 'smooth' });
      composer.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="flex w-full max-w-[1280px]">
        <Sidebar
          activeNav={activeNav}
          onNavChange={handleNavChange}
          onPost={handlePost}
        />
        <main className="flex-1 flex justify-center px-4 min-w-0">
          <Feed
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </main>
        <RightSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
    </div>
  );
};

export default Index;
