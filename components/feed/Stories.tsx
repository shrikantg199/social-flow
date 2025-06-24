"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { StoryViewer } from "./StoryViewer";

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

interface StoriesProps {
  currentUser: {
    _id: string;
    name: string;
    profilePicture: string;
  };
}

export function Stories({ currentUser }: StoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newStoryImage, setNewStoryImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewStoryImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = async () => {
    if (!newStoryImage) return;
    setUploading(true);
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: newStoryImage }),
      });
      if (!uploadRes.ok) throw new Error("Failed to upload image");

      const { url } = await uploadRes.json();

      const storyRes = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      if (!storyRes.ok) throw new Error("Failed to create story");

      setNewStoryImage(null);
      fetchStories(); // Refresh stories
      toast({
        title: "Success",
        description: "Your story has been posted!",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to post your story.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const openStoryViewer = (index: number) => {
    setSelectedStoryIndex(index);
    setIsViewerOpen(true);
  };

  const hasUserStory = stories.some(
    (story) => story.user._id === currentUser._id
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {/* Your Story */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px]"
                onClick={() =>
                  hasUserStory
                    ? openStoryViewer(
                        stories.findIndex((s) => s.user._id === currentUser._id)
                      )
                    : fileInputRef.current?.click()
                }
              >
                <div
                  className={`relative ${
                    hasUserStory
                      ? "p-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                      : ""
                  }`}
                >
                  <Avatar className="w-16 h-16 border-2 border-white dark:border-slate-900">
                    <AvatarImage
                      src={currentUser.profilePicture || undefined}
                      alt="Your Story"
                    />
                    <AvatarFallback>
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {!hasUserStory && (
                    <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white dark:border-slate-900">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate w-16 text-center">
                  Your Story
                </span>
              </motion.div>
              {/* Other Stories */}
              {stories.map(
                (story, index) =>
                  story.user._id !== currentUser._id && (
                    <motion.div
                      key={story._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px]"
                      onClick={() => openStoryViewer(index)}
                    >
                      <div className="p-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full">
                        <Avatar className="w-16 h-16 border-2 border-white dark:border-slate-900">
                          <AvatarImage
                            src={story.user.profilePicture || undefined}
                            alt={story.user.name}
                          />
                          <AvatarFallback>
                            {story.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate w-16 text-center">
                        {story.user.name}
                      </span>
                    </motion.div>
                  )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Story Viewer */}
      {isViewerOpen && (
        <StoryViewer
          stories={stories}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
      {/* New Story Preview Modal */}
      {newStoryImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="relative bg-slate-900 rounded-lg p-4 max-w-sm w-full">
            <h2 className="text-white text-lg font-semibold text-center mb-4">
              Post your story?
            </h2>
            <Image
              src={newStoryImage}
              alt="Story preview"
              width={300}
              height={500}
              className="rounded-lg object-contain"
            />
            <div className="flex justify-around mt-4">
              <button
                onClick={() => setNewStoryImage(null)}
                className="text-white font-semibold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStory}
                disabled={uploading}
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
            <button
              onClick={() => setNewStoryImage(null)}
              className="absolute top-2 right-2 text-white/80 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
