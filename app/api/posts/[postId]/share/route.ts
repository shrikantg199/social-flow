import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/app/lib/db';
import Post from '@/app/models/Post';
import User from '@/app/models/User';

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId } = params;

    await connectDB();

    // Get the user from our database
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const shareIndex = post.shares.indexOf(user._id);
    if (shareIndex === -1) {
      // Share the post
      post.shares.push(user._id);
    } else {
      // Unshare the post
      post.shares.splice(shareIndex, 1);
    }

    await post.save();
    await post.populate('author', 'name profilePicture');

    return NextResponse.json(post);
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json(
      { error: 'Error processing share' },
      { status: 500 }
    );
  }
} 