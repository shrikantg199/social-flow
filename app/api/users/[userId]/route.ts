import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import User from '@/app/models/User';
import Post from '@/app/models/Post';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    await connectDB();

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's posts
    const posts = await Post.find({ author: userId })
      .populate('author', 'name profilePicture')
      .populate('likes', 'name')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      user,
      posts,
    });
  } catch (error) {
    console.error('Fetch user profile error:', error);
    return NextResponse.json(
      { error: 'Error fetching user profile' },
      { status: 500 }
    );
  }
} 