import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/app/lib/db';
import User from '@/app/models/User';
import mongoose from 'mongoose';
import Notification from '@/app/models/Notification';

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId: targetUserId } = params;
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    // Get current user and target user
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    if (currentUser._id.toString() === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Check if already following
    const isFollowing = currentUser.following.some((id: any) => id.toString() === targetUserId);
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id: any) => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter((id: any) => id.toString() !== currentUser._id.toString());
    } else {
      // Follow
      currentUser.following.push(new mongoose.Types.ObjectId(targetUserId));
      targetUser.followers.push(new mongoose.Types.ObjectId(currentUser._id));
      // Create notification for target user
      await Notification.create({
        userId: targetUser._id,
        type: 'follow',
        title: 'New Follower',
        message: `${currentUser.name} started following you`,
        fromUserId: currentUser._id,
        createdAt: new Date(),
        read: false,
      });
    }
    await currentUser.save();
    await targetUser.save();

    return NextResponse.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    return NextResponse.json({ error: 'Error processing follow/unfollow' }, { status: 500 });
  }
} 