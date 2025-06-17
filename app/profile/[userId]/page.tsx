"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Post from "../../components/Post";

interface User {
  _id: string;
  name: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  following: string[];
}

interface Post {
  _id: string;
  content: string;
  images: string[];
  author: User;
  likes: string[];
  comments: {
    _id: string;
    user: User;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export default function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, [params.userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      setUser(data.user);
      setPosts(data.posts);
    } catch (err) {
      setError("Error loading profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: "current-user-id" }), // Replace with actual user ID
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleComment = async (postId: string, text: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "current-user-id", // Replace with actual user ID
          text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error || "User not found"}</p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            <Image
              src={user.profilePicture || "/default-avatar.png"}
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.bio}</p>
            <div className="flex space-x-4 mt-2">
              <div>
                <span className="font-semibold">{user.followers.length}</span>{" "}
                followers
              </div>
              <div>
                <span className="font-semibold">{user.following.length}</span>{" "}
                following
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Posts</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <Post
            key={post._id}
            {...post}
            currentUserId="current-user-id" // Replace with actual user ID
            onLike={handleLike}
            onComment={handleComment}
          />
        ))}
      </div>
    </main>
  );
}
