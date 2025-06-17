"use client";

import { useState, useRef } from "react";
import { X, Image as ImageIcon, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    username: string;
    avatar: string;
  };
  onCreatePost: (content: string, image?: string) => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  currentUser,
  onCreatePost,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (imageData: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;

    setIsSubmitting(true);
    try {
      let imageUrl = uploadedImageUrl;

      // If there's a new image selected, upload it first
      if (selectedImage && !uploadedImageUrl) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          throw new Error("Failed to upload image");
        }
      }

      await onCreatePost(content, imageUrl || undefined);

      toast.success("Post created successfully!");
      setContent("");
      setSelectedImage(null);
      setUploadedImageUrl(null);
      onClose();

      // No need to force refresh, Feed component will update its state
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[80vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 sm:gap-4">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected"
                className="max-h-[200px] sm:max-h-[300px] w-full object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleImageClick}
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={(!content.trim() && !selectedImage) || isSubmitting}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
