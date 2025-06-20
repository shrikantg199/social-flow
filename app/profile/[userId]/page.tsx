"use client";

import { useState, useEffect, Fragment, useRef } from "react";
import Image from "next/image";
import Post from "../../components/Post";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePostGrid from "@/components/profile/ProfilePostGrid";
import { Header } from "@/components/layout/Header";
import { Dialog } from "@headlessui/react";

interface User {
  _id: string;
  name: string;
  username: string;
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  // Profile image update state
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [params.userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.userId}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      setUser({
        ...data.user,
        username: data.user.username || data.user.name,
      });
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

  // Modal close handler
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  // Modal open handler
  const openModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  // Handle profile image file selection
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewProfileImage(ev.target?.result as string);
        setIsEditingImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload to Cloudinary and update profile
  const handleUpdateProfileImage = async () => {
    if (!user || !newProfileImage) return;
    setUploading(true);
    try {
      // Upload to Cloudinary via API route
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: newProfileImage }),
      });
      if (!uploadRes.ok) throw new Error("Failed to upload image");
      const { url } = await uploadRes.json();
      // Update user profile with new image URL
      const patchRes = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePicture: url }),
      });
      if (!patchRes.ok) throw new Error("Failed to update profile image");
      // Refetch user profile
      await fetchUserProfile();
      setIsEditingImage(false);
      setNewProfileImage(null);
    } catch (err) {
      alert("Error updating profile image.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Open edit modal and prefill fields
  const openEditModal = () => {
    if (user) {
      setEditName(user.name);
      setEditUsername(user.username);
      setEditBio(user.bio);
      setIsEditModalOpen(true);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const patchRes = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          username: editUsername,
          bio: editBio,
        }),
      });
      if (!patchRes.ok) throw new Error("Failed to update profile");
      await fetchUserProfile();
      setIsEditModalOpen(false);
      window.location.reload(); // Ensure all components get the latest user info
    } catch (err) {
      alert("Error updating profile.");
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <span className="text-blue-600 font-semibold text-lg">
          Loading profile...
        </span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <p className="text-red-500 text-xl font-semibold mb-2">
          {error || "User not found"}
        </p>
        <span className="text-gray-500">Please try again later.</span>
      </div>
    );
  }

  return (
    <>
      {user && (
        <Header
          currentUser={{
            _id: user._id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
            verified: false,
          }}
        />
      )}
      <main className="max-w-4xl mx-auto p-4 bg-white min-h-screen pt-20">
        {/* Instagram-like Profile Header */}
        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-8 py-8 border-b border-gray-200">
          {/* Profile image with update overlay */}
          <div
            className="relative flex-shrink-0 flex justify-center items-center w-32 h-32 rounded-full overflow-hidden border border-gray-300 bg-gray-100 group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image
              src={
                (newProfileImage || user.profilePicture) + `?t=${Date.now()}`
              }
              alt={user.name}
              width={128}
              height={128}
              className="object-cover w-full h-full"
              priority
            />
            {/* Camera overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5V7.5A2.25 2.25 0 015.25 5.25h2.086a2.25 2.25 0 001.591-.659l.828-.828A2.25 2.25 0 0111.25 3h1.5a2.25 2.25 0 011.591.659l.828.828a2.25 2.25 0 001.591.659h2.086A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5z"
                />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
            </div>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageChange}
            />
          </div>
          <div className="flex-1 flex flex-col items-center sm:items-start gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <span className="text-2xl font-semibold text-gray-800">
                {user.name}
              </span>
              {/* Placeholder for Edit Profile/Follow button */}
              <button
                className="ml-0 sm:ml-6 px-4 py-1 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 transition"
                onClick={openEditModal}
              >
                Edit Profile
              </button>
            </div>
            <div className="flex gap-8 mt-2">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-lg">{posts.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Posts
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-lg">
                  {user.followers.length}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Followers
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-lg">
                  {user.following.length}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Following
                </span>
              </div>
            </div>
            <p className="text-gray-700 text-center sm:text-left mt-2 max-w-xl">
              {user.bio}
            </p>
          </div>
        </section>
        {/* Show update button and preview if editing image */}
        {isEditingImage && newProfileImage && (
          <div className="flex flex-col items-center mt-4 gap-2">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-400">
              <Image
                src={newProfileImage}
                alt="New profile preview"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            <button
              className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
              onClick={handleUpdateProfileImage}
              disabled={uploading}
            >
              {uploading ? "Updating..." : "Update Profile Image"}
            </button>
          </div>
        )}

        {/* Instagram-like Posts Grid */}
        <section className="mt-8">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="text-gray-400 text-lg">No posts yet.</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-1 md:gap-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer"
                  onClick={() => openModal(post)}
                >
                  {post.images && post.images.length > 0 ? (
                    <Image
                      src={post.images[0]}
                      alt="Post image"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-300 text-4xl bg-gray-200">
                      🖼️
                    </div>
                  )}
                  {/* Multiple images icon overlay */}
                  {post.images && post.images.length > 1 && (
                    <span className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H7a2 2 0 01-2-2v-2.882a2 2 0 01.447-1.342L10 10m5 0V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v4m5 0H9"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal for post details */}
        {isModalOpen && selectedPost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-lg shadow-lg max-w-2xl w-full flex flex-col md:flex-row overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Images carousel (show first image only for now) */}
              <div className="md:w-2/3 w-full bg-black flex items-center justify-center relative aspect-square">
                {selectedPost.images && selectedPost.images.length > 0 ? (
                  <Image
                    src={selectedPost.images[0]}
                    alt="Post image"
                    fill
                    className="object-contain bg-black"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-300 text-4xl bg-gray-900">
                    🖼️
                  </div>
                )}
              </div>
              {/* Post actions and comments */}
              <div className="md:w-1/3 w-full flex flex-col p-4">
                {/* User info */}
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src={selectedPost.author.profilePicture}
                    alt={selectedPost.author.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-700">
                    {selectedPost.author.name}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-6 mb-2">
                  {/* Like */}
                  <button className="hover:scale-110 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-7 h-7 text-gray-700 hover:text-red-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487a5.5 5.5 0 00-7.78 0L7.05 6.518a5.5 5.5 0 000 7.778l7.072 7.072a.75.75 0 001.06 0l7.072-7.072a5.5 5.5 0 000-7.778l-2.032-2.031z"
                      />
                    </svg>
                  </button>
                  {/* Comment */}
                  <button className="hover:scale-110 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-7 h-7 text-gray-700 hover:text-blue-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 15.75A2.25 2.25 0 0119.5 18H6.75l-4.5 4.5V6.75A2.25 2.25 0 014.5 4.5h15A2.25 2.25 0 0121.75 6.75v9z"
                      />
                    </svg>
                  </button>
                  {/* Share */}
                  <button className="hover:scale-110 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-7 h-7 text-gray-700 hover:text-green-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 8.25V6a3.75 3.75 0 10-7.5 0v2.25m7.5 0A2.25 2.25 0 0121 10.5v7.125c0 1.243-1.007 2.25-2.25 2.25H5.25A2.25 2.25 0 013 17.625V10.5a2.25 2.25 0 012.25-2.25m10.5 0h-7.5"
                      />
                    </svg>
                  </button>
                </div>
                {/* Like and comment counts */}
                <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                  <span className="font-semibold">
                    {selectedPost.likes.length} likes
                  </span>
                  <span>{selectedPost.comments.length} comments</span>
                </div>
                {/* Post content */}
                <div className="mb-2 text-gray-800 text-sm line-clamp-3">
                  {selectedPost.content}
                </div>
                {/* Comments */}
                <div className="flex-1 overflow-y-auto mb-2">
                  {selectedPost.comments.length === 0 ? (
                    <div className="text-gray-400 text-sm">
                      No comments yet.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {selectedPost.comments.map((comment) => (
                        <li
                          key={comment._id}
                          className="flex items-start gap-2"
                        >
                          <Image
                            src={comment.user.profilePicture}
                            alt={comment.user.name}
                            width={24}
                            height={24}
                            className="rounded-full object-cover mt-1"
                          />
                          <div>
                            <span className="font-medium text-gray-700 text-xs">
                              {comment.user.name}
                            </span>{" "}
                            <span className="text-gray-600 text-xs">
                              {comment.text}
                            </span>
                            <div className="text-gray-400 text-[10px]">
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Add comment input */}
                <form
                  className="flex items-center gap-2 border-t pt-2"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    ref={commentInputRef}
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 px-2 py-1 rounded bg-gray-100 text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="text-blue-500 font-semibold text-sm hover:underline"
                  >
                    Post
                  </button>
                </form>
              </div>
              {/* Close button */}
              <button
                className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 shadow"
                onClick={closeModal}
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          className="fixed z-50 inset-0 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-40"
              aria-hidden="true"
            />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6 z-10">
              <Dialog.Title className="text-lg font-bold mb-4">
                Edit Profile
              </Dialog.Title>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Name</span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Username</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Bio</span>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={savingProfile}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:opacity-60"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </main>
    </>
  );
}
