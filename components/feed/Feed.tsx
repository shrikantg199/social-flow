"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreatePost } from "./CreatePost";
import { Post } from "./Post";
import { Stories } from "./Stories";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";

interface FeedProps {
  currentUser: {
    _id: string;
    name: string;
    username: string;
    profilePicture: string;
  };
}

export function Feed({ currentUser }: FeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { userId } = useAuth();

  const fetchPosts = async (pageNum: number = 1, refresh: boolean = false) => {
    if (refresh) {
      setLoading(true);
      setPage(1);
    }
    try {
      const res = await fetch(`/api/posts?page=${pageNum}`);
      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await res.json();
      if (refresh) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 20); // If we get less than 20 posts, we've reached the end
      setError(null);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
      if (refresh) {
        setPosts([]);
      }
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    setRefreshing(true);
    await fetchPosts(1, true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (content: string, image?: string) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, images: image ? [image] : [] }),
      });

      if (!res.ok) {
        throw new Error("Failed to create post");
      }

      const newPost = await res.json();
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Map API data to UI structure
  const mappedPosts = posts.map((post) => ({
    _id: post._id,
    author: {
      _id: post.author?._id || "",
      name: post.author?.name || "Unknown",
      username: post.author?.username || "unknown",
      profilePicture: post.author?.profilePicture || "",
      verified: post.author?.verified || false,
    },
    content: post.content,
    images: post.images || [],
    likes: post.likes || [],
    comments: post.comments || [],
    shares: post.shares || [],
    createdAt: post.createdAt,
  }));

  // Map currentUser to the shape expected by CreatePost
  const mappedUser = {
    id: currentUser._id,
    name: currentUser.name,
    username: currentUser.username,
    avatar: currentUser.profilePicture,
    verified: false, // Set to false or use currentUser.verified if available
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to bookmark post");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error("Error bookmarking post:", error);
      toast({
        title: "Error",
        description: "Failed to bookmark post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Stories currentUser={currentUser} />
      </motion.div>

      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <CreatePost currentUser={mappedUser} onCreatePost={handleCreatePost} />
      </motion.div>

      {/* Refresh Button */}
      <div className="flex justify-center items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshPosts}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Refresh Feed"
          )}
        </motion.button>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Showing latest posts
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 text-red-500"
        >
          {error}
        </motion.div>
      )}

      {/* Posts */}
      <AnimatePresence mode="wait">
        {loading && page === 1 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </motion.div>
        ) : mappedPosts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 text-slate-500 dark:text-slate-400"
          >
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-2">Be the first to share something!</p>
          </motion.div>
        ) : (
          <motion.div
            key="posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {mappedPosts.map((post, idx) => (
              <motion.div
                key={`${post._id || "noid"}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                layout
              >
                <Post
                  post={post}
                  currentUserId={currentUser._id}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                />
              </motion.div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMore}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Load More"
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
