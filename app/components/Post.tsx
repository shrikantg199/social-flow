import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  text: string;
  createdAt: string;
}

interface PostProps {
  _id: string;
  content: string;
  images: string[];
  author: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  likes: string[];
  comments: Comment[];
  createdAt: string;
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
}

export default function Post({
  _id,
  content,
  images,
  author,
  likes,
  comments,
  createdAt,
  currentUserId,
  onLike,
  onComment,
}: PostProps) {
  const [commentText, setCommentText] = useState("");

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(_id, commentText);
      setCommentText("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
          <Image
            src={author.profilePicture || "/default-avatar.png"}
            alt={author.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold">{author.name}</h3>
          <p className="text-gray-500 text-sm">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <p className="mb-4">{content}</p>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={image}
                alt={`Post image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => onLike(_id)}
          className={`flex items-center space-x-1 ${
            likes.includes(currentUserId) ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{likes.length}</span>
        </button>
      </div>

      <div className="border-t pt-4">
        <div className="space-y-4 mb-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex space-x-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={comment.user.profilePicture || "/default-avatar.png"}
                  alt={comment.user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg p-2">
                <p className="font-semibold text-sm">{comment.user.name}</p>
                <p className="text-sm">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleComment} className="flex space-x-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
