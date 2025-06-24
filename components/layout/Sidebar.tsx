"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  PlusCircle,
  Hash,
  TrendingUp,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useClerk, useAuth } from "@clerk/nextjs";
import { CreatePostModal } from "@/components/modals/CreatePostModal";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentUser: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({
  currentUser,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  if (!currentUser) {
    return null;
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, badge: null, path: "/" },
    {
      id: "explore",
      label: "Explore",
      icon: Search,
      badge: null,
      path: "/explore",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge: 3,
      path: "/notifications",
    },
    {
      id: "messages",
      label: "Messages",
      icon: Mail,
      badge: 1,
      path: "/messages",
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      badge: null,
      path: "/bookmarks",
    },
    {
      id: "trending",
      label: "Trending",
      icon: TrendingUp,
      badge: null,
      path: "/trending",
    },
    { id: "topics", label: "Topics", icon: Hash, badge: null, path: "/topics" },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      badge: null,
      path: "/profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      badge: null,
      path: "/settings",
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force a hard navigation to sign-in page
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error signing out:", error);
      window.location.href = "/sign-in";
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    if (!pathname) return false;
    return pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-20 h-[calc(100vh-5rem)] md:top-0 md:h-full w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 z-40 transition-transform duration-300 ease-in-out",
          isMobile && !isMobileMenuOpen && "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4 pt-20">
          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {menuItems.map((item) => (
              <div key={item.id}>
                <Link href={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-12 transition-all duration-200",
                      isActive(item.path)
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
            ))}
          </nav>

          {/* Create Post Button */}
          <div className="mb-6">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-12 rounded-full transition-all duration-200 hover:scale-[1.02]"
              onClick={() => setIsCreatePostModalOpen(true)}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Post
            </Button>
          </div>

          {/* User Profile */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-200">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={currentUser?.avatar || ""}
                  alt={currentUser?.name || "User"}
                />
                <AvatarFallback>
                  {currentUser?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {currentUser?.name || "User"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                  @{currentUser?.username || "username"}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed top-20 left-0 right-0 bottom-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        currentUser={currentUser}
        onCreatePost={() => {
          // Handle post creation
          setIsCreatePostModalOpen(false);
        }}
      />
    </>
  );
}
