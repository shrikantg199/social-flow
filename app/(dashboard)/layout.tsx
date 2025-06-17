"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    redirect("/");
  }

  const currentUser = {
    id: parseInt(user.id || "0"),
    name: user.fullName || user.firstName || "User",
    username:
      user.username ||
      user.emailAddresses[0]?.emailAddress.split("@")[0] ||
      "user",
    avatar: user.imageUrl || "",
    verified: false,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      <div className="flex flex-col lg:flex-row">
        <Sidebar currentUser={currentUser} />
        <div className="flex-1 lg:pl-80">
          <Header currentUser={currentUser} />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto px-2 sm:px-6 py-6 sm:py-8 lg:px-0"
          >
            {children}
          </motion.div>
        </div>
        <div className="hidden lg:block w-84 p-6">
          <RightSidebar />
        </div>
      </div>
    </motion.div>
  );
}
