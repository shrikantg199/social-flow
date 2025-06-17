"use client";

import { useState } from "react";
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
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

export function Post({ post, onLike, onBookmark }: PostProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likes.includes(post._id));
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(post._id);
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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200 ">
        <CardContent className="p-4 ">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 dark:group-hover:ring-blue-500 transition-all duration-200">
                <AvatarImage
                  src={post.author.profilePicture}
                  alt={post.author.name}
                />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-sm hover:text-blue-500 transition-colors duration-200">
                    {post.author.name}
                  </p>
                  {post.author.verified && (
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-slate-500 text-xs">
                  @{post.author.username} · {formatDate(post.createdAt)}
                </p>
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
          <div className="mb-3">
            <p className="text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Image */}
          {post.images && post.images.length > 0 && (
            <motion.div
              className="mb-3 rounded-xl overflow-hidden relative group/image"
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative aspect-video">
                <Image
                  src={post.images[0]}
                  alt="Post content"
                  fill
                  className="object-cover cursor-pointer"
                  onLoad={() => setImageLoaded(true)}
                  onClick={() => setShowFullImage(true)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-200" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-6">
              {/* Like */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2 group/like transition-colors duration-200",
                  isLiked ? "text-red-500" : "text-slate-500 hover:text-red-500"
                )}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    isLiked ? "fill-current" : "group-hover/like:fill-current"
                  )}
                />
                <span className="text-sm">{post.likes.length}</span>
              </motion.button>

              {/* Comment */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-500 group/comment transition-colors duration-200"
              >
                <MessageCircle className="w-4 h-4 group-hover/comment:fill-current transition-colors duration-200" />
                <span className="text-sm">{post.comments.length}</span>
              </motion.button>

              {/* Share */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-slate-500 hover:text-green-500 group/share transition-colors duration-200"
              >
                <Repeat2 className="w-4 h-4 group-hover/share:text-green-500 transition-colors duration-200" />
                <span className="text-sm">{post.shares.length}</span>
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              {/* Bookmark */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBookmark}
                className={cn(
                  "p-2 rounded-full transition-colors duration-200",
                  isBookmarked
                    ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                )}
              >
                <Bookmark
                  className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    isBookmarked && "fill-current"
                  )}
                />
              </motion.button>

              {/* Share */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
              >
                <Share className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Image Modal */}
      <AnimatePresence>
        {showFullImage && post.images && post.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowFullImage(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full mx-4 aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={post.images[0]}
                alt="Post content"
                fill
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
