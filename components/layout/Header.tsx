"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useNotificationsStore } from "@/lib/store/notifications";
import Image from "next/image";

interface HeaderProps {
  currentUser: {
    _id: string;
    name: string;
    username: string;
    profilePicture: string;
    verified: boolean;
  };
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Add this type for user search results
interface UserSearchResult {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
}

export function Header({
  currentUser,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { unreadCount } = useNotificationsStore();
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data);
          setSearchLoading(false);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSignOut = async () => {
    try {
      if (isSignedIn) {
        await signOut();
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Hamburger menu for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg -ml-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image
              src="/assets/logo.png"
              alt="SocialFlow Logo"
              width={80}
              height={80}
            />
            <span className="hidden sm:inline bg-gradient-to-r from-purple-800 via-blue-700 to-orange-500 bg-clip-text text-transparent">
              SocialFlow
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="pl-10 bg-slate-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-blue-500 rounded-full transition-all duration-200 w-full"
            />
            {/* User Search Dropdown */}
            {isSearchFocused && searchQuery && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-slate-500">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    No users found
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        setIsSearchFocused(false);
                        router.push(`/profile/${user._id}`);
                      }}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user.profilePicture}
                          alt={user.name}
                        />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">{user.name}</div>
                        <div className="text-xs text-slate-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Button>
          </Link>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <Link href="/settings/profile">
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              </Link>
              <Link href="/settings/privacy">
                <DropdownMenuItem>Privacy & Safety</DropdownMenuItem>
              </Link>
              <Link href="/settings/notifications">
                <DropdownMenuItem>Notifications</DropdownMenuItem>
              </Link>
              <Link href="/help">
                <DropdownMenuItem>Help Center</DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar */}
          <Link href={`/profile/${currentUser._id}`}>
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarImage
                src={currentUser.profilePicture}
                alt={currentUser.name}
              />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
