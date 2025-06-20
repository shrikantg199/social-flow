import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Post from '@/app/models/Post';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId)
      .populate('author', 'name profilePicture username')
      .populate('likes', 'name profilePicture username')
      .populate('comments.user', 'name profilePicture username');

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Fetch post error:', error);
    return NextResponse.json(
      { error: 'Error fetching post' },
      { status: 500 }
    );
  }
} 