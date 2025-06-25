import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/app/lib/db';
import Post from '@/app/models/Post';
import User from '@/app/models/User';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { content, images } = await req.json();

    // Find or create the user
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Get user info from Clerk
      const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());

      // Create new user in database
      user = await User.create({
        clerkId: userId,
        name: clerkUser.first_name + ' ' + clerkUser.last_name,
        email: clerkUser.email_addresses[0]?.email_address || '',
        profilePicture: clerkUser.image_url || '',
      });
    }

    // Extract hashtags from content
    const hashtags = content.match(/#\w+/g) || [];

    // Create new post
    const newPost = new Post({
      author: user._id,
      content,
      images,
      hashtags: hashtags.map((tag: string) => tag.toLowerCase()),
    });

    await newPost.save();

    // Populate author information
    await newPost.populate('author', 'name profilePicture');

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // Get user info from Clerk
      const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());

      // Create new user in database
      user = await User.create({
        clerkId: userId,
        name: clerkUser.first_name + ' ' + clerkUser.last_name,
        email: clerkUser.email_addresses[0]?.email_address || '',
        profilePicture: clerkUser.image_url || '',
        following: [], // Make sure to initialize following as an empty array
      });
    }

    let posts;

    // If the user is not following anyone, show them all posts (including their own)
    if (user && user.following.length === 0) {
      posts = await Post.find() // Show ALL posts
        .populate("author", "name username profilePicture verified")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      // If the user is following people, show posts from those users
      const followingIds = user ? user.following : [];
      posts = await Post.find({ author: { $in: followingIds } })
        .populate("author", "name username profilePicture verified")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}