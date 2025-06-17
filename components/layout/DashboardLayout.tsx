"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function DashboardLayout({
  children,
  title,
  description,
}: DashboardLayoutProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex">
        <Sidebar currentUser={currentUser} />

        <div className="flex-1 lg:ml-64">
          <Header currentUser={currentUser} />

          <div className="px-6 py-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-slate-600 dark:text-slate-400">
                {description}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">{children}</div>
              <div className="hidden lg:block">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
