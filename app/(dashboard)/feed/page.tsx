"use client";

import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Feed } from "@/components/feed/Feed";

export default function FeedPage() {
  const { currentUser, loading } = useCurrentUser();
  if (loading || !currentUser) return null;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="lg:col-span-2">
          <Feed currentUser={currentUser} />
        </div>
      </div>
    </>
  );
}
