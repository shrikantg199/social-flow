"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

interface User {
  _id: string;
  name: string;
  username?: string;
  profilePicture: string;
}

interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  images: string[];
  author: User;
  likes: User[];
  comments: Comment[];
  createdAt: string;
}

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/posts/${postId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch post");
        return res.json();
      })
      .then((data) => {
        setPost(data.post || data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error loading post");
        setLoading(false);
      });
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error || "Post not found"}</p>
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={post.author.profilePicture || "/default-avatar.png"}
          alt={post.author.name}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <div className="font-semibold">{post.author.name}</div>
          <div className="text-sm text-gray-500">@{post.author.username}</div>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-lg">{post.content}</p>
        {post.images?.length > 0 && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {post.images.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                alt="Post image"
                width={500}
                height={500}
                className="rounded"
              />
            ))}
          </div>
        )}
      </div>
      <div className="mb-2 text-gray-600 text-sm">
        {post.likes.length} likes
      </div>
      <div>
        <h3 className="font-semibold mb-2">Comments</h3>
        {post.comments.length === 0 ? (
          <div className="text-gray-500">No comments yet.</div>
        ) : (
          <ul className="space-y-2">
            {post.comments.map((comment) => (
              <li key={comment._id} className="flex gap-2 items-start">
                <Image
                  src={comment.user.profilePicture || "/default-avatar.png"}
                  alt={comment.user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <div className="font-semibold text-sm">
                    {comment.user.name}
                  </div>
                  <div className="text-xs text-gray-500">{comment.text}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
