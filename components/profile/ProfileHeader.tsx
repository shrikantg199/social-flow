import Image from "next/image";

interface User {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  following: string[];
  postsCount?: number;
}

export default function ProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-8 mb-8">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2">
        <Image
          src={user.profilePicture || "/default-avatar.png"}
          alt={user.name}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-2xl font-bold">{user.username}</h2>
          {/* Follow/Edit button here */}
        </div>
        <div className="flex gap-6 mb-2">
          <span>
            <b>{user.postsCount ?? 0}</b> posts
          </span>
          <span>
            <b>{user.followers?.length ?? 0}</b> followers
          </span>
          <span>
            <b>{user.following?.length ?? 0}</b> following
          </span>
        </div>
        <div>
          <span className="font-semibold">{user.name}</span>
          <p className="text-gray-600">{user.bio}</p>
        </div>
      </div>
    </div>
  );
}
