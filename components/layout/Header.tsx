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

interface HeaderProps {
  currentUser: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
}

export function Header({ currentUser }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const router = useRouter();

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
      className="fixed top-0 left-0 lg:left-[250px] right-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search SocialFlow..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "pl-10 bg-slate-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-blue-500 rounded-full transition-all duration-200",
                isSearchFocused ? "w-full" : "w-full sm:w-[300px] md:w-[400px]"
              )}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {/* Notifications */}
          <Link href="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
          </Link>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
            >
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  Profile Settings
                </DropdownMenuItem>
              </Link>
              <Link href="/privacy">
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  Privacy & Safety
                </DropdownMenuItem>
              </Link>
              <Link href="/notifications">
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  Notifications
                </DropdownMenuItem>
              </Link>
              <Link href="/help">
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  Help Center
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar */}
          <Link href="/profile">
            <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-blue-500 dark:hover:ring-blue-500 transition-all duration-200">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700"
          >
            <div className="px-4 py-2 space-y-1">
              <Link href="/profile">
                <Button variant="ghost" className="w-full justify-start">
                  Profile Settings
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="ghost" className="w-full justify-start">
                  Privacy & Safety
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" className="w-full justify-start">
                  Notifications
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="ghost" className="w-full justify-start">
                  Help Center
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
