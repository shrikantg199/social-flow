"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

interface Story {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  image: string;
  createdAt: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

export function StoryViewer({
  stories,
  initialStoryIndex,
  onClose,
}: StoryViewerProps) {
  const [currentUserStories, setCurrentUserStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    const userStories = stories.filter(
      (s) => s.user._id === stories[initialStoryIndex].user._id
    );
    const initialIndexInUserStories = userStories.findIndex(
      (s) => s._id === stories[initialStoryIndex]._id
    );
    setCurrentUserStories(userStories);
    setCurrentStoryIndex(initialIndexInUserStories);
  }, [stories, initialStoryIndex]);

  useEffect(() => {
    if (currentUserStories.length === 0) return;

    const timer = setTimeout(() => {
      if (currentStoryIndex < currentUserStories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        onClose();
      }
    }, 5000); // 5 seconds per story

    return () => clearTimeout(timer);
  }, [currentStoryIndex, currentUserStories, onClose]);

  if (currentUserStories.length === 0) {
    return null;
  }

  const currentStory = currentUserStories[currentStoryIndex];

  const goToPrevious = () => {
    setCurrentStoryIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentStoryIndex((prev) =>
      Math.min(currentUserStories.length - 1, prev + 1)
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm h-[90vh] bg-slate-900 rounded-lg overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bars */}
          <div className="absolute top-2 left-2 right-2 flex gap-1">
            {currentUserStories.map((_, index) => (
              <div key={index} className="w-full bg-white/30 h-1 rounded-full">
                <motion.div
                  className="bg-white h-1 rounded-full"
                  initial={{ width: index < currentStoryIndex ? "100%" : "0%" }}
                  animate={{
                    width:
                      index === currentStoryIndex
                        ? "100%"
                        : index < currentStoryIndex
                          ? "100%"
                          : "0%",
                  }}
                  transition={{ duration: index === currentStoryIndex ? 5 : 0 }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-5 left-4 flex items-center gap-3 z-10">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage
                src={currentStory.user.profilePicture || undefined}
                alt={currentStory.user.name}
              />
              <AvatarFallback>
                {currentStory.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-white">
                {currentStory.user.name}
              </div>
              <div className="text-xs text-white/80">
                {formatDate(currentStory.createdAt)}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <X size={28} />
          </button>

          {/* Story Image */}
          <Image
            src={currentStory.image}
            alt={`Story by ${currentStory.user.name}`}
            fill
            className="object-contain"
          />

          {/* Navigation */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button
              onClick={goToPrevious}
              className="p-2 text-white/80 hover:text-white"
            >
              <ChevronLeft size={32} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              onClick={goToNext}
              className="p-2 text-white/80 hover:text-white"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
