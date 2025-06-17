"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreatePost } from "./CreatePost";
import { Post } from "./Post";
import { Stories } from "./Stories";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface FeedProps {
  currentUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
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

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleBookmark = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Stories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Stories />
      </motion.div>

      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <CreatePost currentUser={currentUser} onCreatePost={handleCreatePost} />
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
            {mappedPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <Post
                  post={post}
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
