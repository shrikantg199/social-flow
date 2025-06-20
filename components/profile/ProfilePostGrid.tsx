import Image from "next/image";
import Link from "next/link";

interface Post {
  _id: string;
  images: string[];
}

export default function ProfilePostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.map((post) => (
        <Link
          key={post._id}
          href={`/posts/${post._id}`}
          className="aspect-square bg-gray-100 relative block"
        >
          {post.images?.[0] && (
            <Image
              src={post.images[0]}
              alt="Post image"
              fill
              className="object-cover rounded"
            />
          )}
        </Link>
      ))}
    </div>
  );
}
