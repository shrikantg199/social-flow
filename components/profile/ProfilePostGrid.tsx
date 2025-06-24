import { Post as FeedPost } from "../feed/Post";

interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    username: string;
    profilePicture: string;
    verified?: boolean;
  };
  content: string;
  images: string[];
  likes: string[];
  comments: any[];
  shares: string[];
  createdAt: string;
}

export default function ProfilePostGrid({
  posts,
  currentUserId,
  onLike,
  onBookmark,
}: {
  posts: Post[];
  currentUserId: string;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedPost
          key={post._id}
          post={{
            ...post,
            author: {
              ...post.author,
              verified: post.author.verified ?? false,
            },
            shares: post.shares ?? [],
          }}
          currentUserId={currentUserId}
          onLike={onLike}
          onBookmark={onBookmark}
        />
      ))}
    </div>
  );
}
