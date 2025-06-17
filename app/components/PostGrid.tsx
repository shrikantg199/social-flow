import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface User {
  _id: string;
  name: string;
  profilePicture: string;
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

interface PostGridProps {
  posts: Post[];
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
}

export default function PostGrid({
  posts,
  currentUserId,
  onLike,
  onComment,
}: PostGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Post Header */}
          <div className="flex items-center p-3 border-b">
            <div className="relative w-8 h-8 rounded-full overflow-hidden mr-3">
              <Image
                src={post.author.profilePicture || "/default-avatar.png"}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-semibold">{post.author.name}</span>
          </div>

          {/* Post Image */}
          <div className="relative aspect-square">
            <Image
              src={post.images[0] || "/default-post.png"}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>

          {/* Post Actions */}
          <div className="p-3">
            <div className="flex items-center space-x-4 mb-2">
              <button
                onClick={() => onLike(post._id)}
                className={`flex items-center space-x-1 ${
                  post.likes.includes(currentUserId)
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    post.likes.includes(currentUserId) ? "fill-current" : ""
                  }`}
                />
                <span>{post.likes.length}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500">
                <MessageCircle className="w-6 h-6" />
                <span>{post.comments.length}</span>
              </button>
              <button className="text-gray-500">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Post Content */}
            <div className="mb-2">
              <p className="text-sm">
                <span className="font-semibold mr-2">{post.author.name}</span>
                {post.content}
              </p>
            </div>

            {/* Comments Preview */}
            {post.comments.length > 0 && (
              <div className="text-sm text-gray-500 mb-2">
                View all {post.comments.length} comments
              </div>
            )}

            {/* Post Time */}
            <div className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
