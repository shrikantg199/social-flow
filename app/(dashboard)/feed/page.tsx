"use client";

import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Feed } from "@/components/feed/Feed";

export default function FeedPage() {
  const { user } = useUser();

  if (!user) return null;

  const currentUser = {
    id: user.id || "0",
    name: user.fullName || user.firstName || "User",
    username:
      user.username ||
      user.emailAddresses[0]?.emailAddress.split("@")[0] ||
      "user",
    avatar: user.imageUrl || "",
    verified: false,
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Home</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome back, {currentUser.name}!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <Feed currentUser={currentUser} />
        </div>
      </div>
    </>
  );
}
