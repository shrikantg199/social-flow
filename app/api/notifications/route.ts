import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/app/lib/db';
import Notification from '@/app/models/Notification';
import User from '@/app/models/User';

export async function GET() {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('fromUserId', 'name username profilePicture');
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error fetching notifications' }, { status: 500 });
  }
} 