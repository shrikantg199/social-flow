"use client";

import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Feed } from "@/components/feed/Feed";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
  const { currentUser, loading, error } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-lg font-semibold mb-2">No user found.</p>
        <p className="text-gray-500">
          Please complete registration or contact support if this issue
          persists.
        </p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

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
