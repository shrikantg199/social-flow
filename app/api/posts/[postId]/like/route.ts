import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Post from '@/app/models/Post';

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = await req.json();
    const { postId } = params;

    await connectDB();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userId);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error('Like/Unlike error:', error);
    return NextResponse.json(
      { error: 'Error processing like/unlike' },
      { status: 500 }
    );
  }
} 