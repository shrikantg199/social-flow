"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { redirect, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CurrentUser {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
  verified?: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading, error } = useCurrentUser() as {
    currentUser: CurrentUser | null;
    loading: boolean;
    error: any;
  };
  const pathname = usePathname();
  const isMessagesPage = pathname ? pathname.includes("/messages") : false;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      <div className="flex flex-col lg:flex-row">
        <div>
          {/* My Profile Button */}
          <a
            href={`/profile/${currentUser._id}`}
            className="block p-4 text-blue-600 font-bold hover:underline"
          >
            My Profile
          </a>
          <Sidebar
            currentUser={{
              id: Number(currentUser._id) || 0,
              name: currentUser.name,
              username: currentUser.username,
              avatar: currentUser.profilePicture,
              verified: currentUser.verified ?? false,
            }}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>
        <div className="flex-1 lg:pl-80">
          <Header
            currentUser={{
              _id: currentUser._id,
              name: currentUser.name,
              username: currentUser.username,
              profilePicture: currentUser.profilePicture,
              verified: currentUser.verified ?? false,
            }}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={
              isMessagesPage
                ? "w-full"
                : "max-w-2xl mx-auto px-2 sm:px-6 py-6 sm:py-8 lg:px-0"
            }
          >
            {children}
          </motion.div>
        </div>
        <div className="hidden lg:block w-84 p-6">
          <RightSidebar currentUserId={currentUser._id} />
        </div>
      </div>
    </motion.div>
  );
}
