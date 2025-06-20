import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/app/lib/db';
import Post from '@/app/models/Post';
import User from '@/app/models/User';
import mongoose from 'mongoose';

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
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      // Fetch user info from Clerk
      const clerkUserRes = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (!clerkUserRes.ok) {
        return NextResponse.json(
          { error: 'User not found in Clerk' },
          { status: 404 }
        );
      }
      const clerkUser = await clerkUserRes.json();
      // Create new user in database
      user = await User.create({
        clerkId: userId,
        name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim(),
        email: clerkUser.email_addresses?.[0]?.email_address || '',
        profilePicture: clerkUser.image_url || '',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Debug logging
    console.log('User _id:', user._id, typeof user._id);
    console.log('Post.likes before:', post.likes.map((id: any) => id.toString()));
    const likeIndex = post.likes.findIndex(
      (id: any) => id.toString() === user._id.toString()
    );
    console.log('Like index:', likeIndex);
    if (likeIndex === -1) {
      // Force ObjectId
      post.likes.push(new mongoose.Types.ObjectId(user._id));
      console.log('Liked: now', post.likes.map((id: any) => id.toString()));
    } else {
      post.likes.splice(likeIndex, 1);
      console.log('Unliked: now', post.likes.map((id: any) => id.toString()));
    }
    try {
      await post.save();
      console.log('Post.likes after save:', post.likes.map((id: any) => id.toString()));
    } catch (err) {
      console.error('Error saving post:', err);
    }
    
    // Populate the post with necessary data before sending response
    await post.populate('author', 'name profilePicture username');
    await post.populate('likes', '_id');
    await post.populate('comments.user', 'name profilePicture');

    // Convert likes to user IDs before returning
    const postObj = post.toObject();
    postObj.likes = postObj.likes.map((user: any) => user._id.toString());
    return NextResponse.json(postObj);
  } catch (error) {
    console.error('Like/Unlike error:', error);
    const errMsg = (error instanceof Error) ? error.message : String(error);
    return NextResponse.json(
      { error: 'Error processing like/unlike', details: errMsg },
      { status: 500 }
    );
  }
} 