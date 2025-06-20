import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import User from '@/app/models/User';
import Post from '@/app/models/Post';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id })
      .populate('author', 'name profilePicture username')
      .populate('likes', 'name')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });

    // Ensure username is included in user response
    const userObj = user.toObject();
    if (!userObj.username) userObj.username = userObj.name;

    return NextResponse.json({
      user: userObj,
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

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    // Allow updating profilePicture, name, username, bio
    const updateFields: any = {};
    if (body.profilePicture !== undefined) updateFields.profilePicture = body.profilePicture;
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.username !== undefined) updateFields.username = body.username;
    if (body.bio !== undefined) updateFields.bio = body.bio;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, select: '-password' }
    );
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
} 