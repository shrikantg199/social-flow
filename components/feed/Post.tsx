"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  MoreHorizontal,
  BadgeCheck,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useNotificationsStore } from "@/lib/store/notifications";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostProps {
  post: {
    _id: string;
    author: {
      _id: string;
      name: string;
      username: string;
      profilePicture: string;
      verified: boolean;
    };
    content: string;
    images: string[];
    likes: string[];
    comments: any[];
    shares: string[];
    createdAt: string;
  };
  currentUserId: string;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

export function Post({ post, currentUserId, onLike, onBookmark }: PostProps) {
  const { addNotification } = useNotificationsStore();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUserId));
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(post.shares.includes(currentUserId));
  const [commentText, setCommentText] = useState("");
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [shareCount, setShareCount] = useState(post.shares.length);
  const [comments, setComments] = useState(post.comments);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUserId));
    setLikeCount(post.likes.length);
    setIsShared(post.shares.includes(currentUserId));
    setShareCount(post.shares.length);
    setComments(post.comments);
  }, [post.likes, post.shares, post.comments, currentUserId]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log("Like API response:", response.status, data);
      // Convert all IDs to strings for comparison
      const likesAsStrings = (data.likes || []).map((id: string) =>
        id.toString()
      );
      console.log("currentUserId:", currentUserId, "likes:", likesAsStrings);
      if (!response.ok) throw new Error("Failed to like post");
      setIsLiked(likesAsStrings.includes(currentUserId.toString()));
      setLikeCount(likesAsStrings.length);
      onLike(post._id);
      if (!prevLiked) {
        addNotification({
          type: "like",
          title: "New like",
          message: `${post.author.name} liked your post`,
          userId: post.author._id,
          postId: post._id,
        });
      }
    } catch (error) {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
      console.error("Like error:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    const tempId = `temp-${Date.now()}`;
    const newComment = {
      _id: tempId,
      user: {
        _id: "me",
        name: "You",
        profilePicture: "",
      },
      text: commentText,
      createdAt: new Date().toISOString(),
    };
    setComments([...(comments || []), newComment]);
    setCommentText("");
    try {
      const response = await fetch(`/api/posts/${post._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment.text }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      const updatedPost = await response.json();
      setComments(updatedPost.comments);
      addNotification({
        type: "comment",
        title: "New comment",
        message: `${post.author.name} commented on your post`,
        userId: post.author._id,
        postId: post._id,
      });
    } catch (error) {
      setComments((prev) => prev.filter((c) => c._id !== tempId));
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    const prevShared = isShared;
    const prevCount = shareCount;
    setIsShared(!isShared);
    setShareCount(isShared ? shareCount - 1 : shareCount + 1);
    try {
      const response = await fetch(`/api/posts/${post._id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to share post");
      const updatedPost = await response.json();
      setIsShared(updatedPost.shares.includes(post._id));
      setShareCount(updatedPost.shares.length);
      if (!prevShared) {
        addNotification({
          type: "system",
          title: "Post shared",
          message: `${post.author.name}'s post was shared`,
          userId: post.author._id,
          postId: post._id,
        });
      }
    } catch (error) {
      setIsShared(prevShared);
      setShareCount(prevCount);
      toast({
        title: "Error",
        description: "Failed to share post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(post._id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{
        scale: 1.015,
        boxShadow: "0 8px 32px 0 rgba(80,80,180,0.10)",
      }}
      className="transition-all duration-200"
    >
      <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-0">
          {/* Post Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-blue-200 dark:border-blue-800">
                <AvatarImage
                  src={post.author.profilePicture}
                  alt={post.author.name}
                />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-base text-slate-900 dark:text-slate-100">
                    {post.author.name}
                  </span>
                  {post.author.verified && (
                    <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded px-1.5 py-0.5 text-xs flex items-center gap-0.5">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">
                    @{post.author.username}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
              >
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  Not interested
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  Unfollow @{post.author.username}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  Mute @{post.author.username}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  Block @{post.author.username}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  Report post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-3 px-4"
          >
            <p className="text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap text-base">
              {post.content}
            </p>
          </motion.div>

          {/* Image */}
          {post.images && post.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.025 }}
              className="relative aspect-video mb-3 mx-4 overflow-hidden rounded-xl shadow-sm group"
            >
              <Image
                src={post.images[0]}
                alt="Post image"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
              )}
            </motion.div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50 px-4 pb-2">
            <div className="flex items-center gap-6">
              {/* Like */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleLike}
                    disabled={isLiking}
                    className={cn(
                      "flex items-center gap-2 group/like transition-colors duration-200 px-2 py-1 rounded-md",
                      isLiked
                        ? "text-red-700 bg-red-50 dark:bg-red-900/20"
                        : "text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    )}
                  >
                    <motion.span
                      animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <Heart
                        className={cn(
                          "w-4 h-4 transition-colors duration-200",
                          isLiked
                            ? "fill-current text-red-700"
                            : "group-hover/like:fill-current"
                        )}
                      />
                    </motion.span>
                    <span className="text-sm font-medium">{likeCount}</span>
                  </motion.button>
                </TooltipTrigger>
              </Tooltip>

              {/* Comment */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() =>
                      document.getElementById(`comment-${post._id}`)?.focus()
                    }
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-500 group/comment transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <MessageCircle className="w-4 h-4 group-hover/comment:fill-current transition-colors duration-200" />
                    <span className="text-sm font-medium">
                      {comments.length}
                    </span>
                  </motion.button>
                </TooltipTrigger>
              </Tooltip>

              {/* Share */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.15, rotate: 12 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleShare}
                    disabled={isSharing}
                    className={cn(
                      "flex items-center gap-2 group/share transition-colors duration-200 px-2 py-1 rounded-md",
                      isShared
                        ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                        : "text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    )}
                  >
                    <Repeat2 className="w-4 h-4 group-hover/share:text-green-600 transition-colors duration-200" />
                    <span className="text-sm font-medium">{shareCount}</span>
                  </motion.button>
                </TooltipTrigger>
              </Tooltip>
            </div>

            {/* Bookmark */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleBookmark}
                  className={cn(
                    "text-slate-500 hover:text-yellow-500 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
                    isBookmarked &&
                      "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                  )}
                >
                  <Bookmark
                    className={cn(
                      "w-4 h-4 transition-colors duration-200",
                      isBookmarked && "fill-current"
                    )}
                  />
                </motion.button>
              </TooltipTrigger>
            </Tooltip>
          </div>

          {/* Comments Section */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
            {/* Comment Input */}
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                id={`comment-${post._id}`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                disabled={isCommenting}
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={!commentText.trim() || isCommenting}
                className="text-blue-500 hover:text-blue-600"
              >
                Post
              </Button>
            </form>

            {/* Comments List */}
            {comments.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                  },
                }}
                className="mt-4 space-y-4"
              >
                {comments.map((comment, idx) => (
                  <motion.div
                    key={`${comment._id || "noid"}-${idx}`}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="flex gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 last:border-none"
                  >
                    <Avatar className="w-8 h-8 border border-blue-200 dark:border-blue-800">
                      <AvatarImage
                        src={comment.user.profilePicture}
                        alt={comment.user.name}
                      />
                      <AvatarFallback>
                        {comment.user?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {comment.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
