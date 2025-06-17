"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Smile, MapPin, Calendar, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CreatePostModal } from "@/components/modals/CreatePostModal";
import { cn } from "@/lib/utils";

interface CreatePostProps {
  currentUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  onCreatePost: (content: string, image?: string) => void;
}

export function CreatePost({ currentUser, onCreatePost }: CreatePostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={cn(
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 transition-all duration-200",
            isHovered && "shadow-lg"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-2 sm:p-4">
            <div className="flex gap-2 sm:gap-3">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 dark:group-hover:ring-blue-500 transition-all duration-200">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm sm:text-base text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
                  onClick={() => setIsModalOpen(true)}
                >
                  What's happening?
                </Button>

                <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 sm:p-2 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Image className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 sm:p-2 rounded-full text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-200"
                    >
                      <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 sm:p-2 rounded-full text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
                    >
                      <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 sm:p-2 rounded-full text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
                    >
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 sm:p-2 rounded-full text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                    >
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>

                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 hover:scale-105"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onCreatePost={onCreatePost}
      />
    </>
  );
}
