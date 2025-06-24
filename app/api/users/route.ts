import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/lib/database';
import User from '@/app/models/User';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { email, username, firstName, lastName, avatar } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: userId });
    
    if (existingUser) {
      return NextResponse.json({ user: existingUser }, { status: 200 });
    }

    // Create new user
    const newUser = new User({
      clerkId: userId,
      email,
      username,
      firstName,
      lastName,
      avatar,
    });

    await newUser.save();

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Support searching by clerkId or email
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get('clerkId');
    const email = searchParams.get('email');
    if (clerkId) {
      const user = await User.findOne({ clerkId });
      if (user) return NextResponse.json([user], { status: 200 });
      return NextResponse.json([], { status: 200 });
    }
    if (email) {
      const user = await User.findOne({ email });
      if (user) return NextResponse.json([user], { status: 200 });
      return NextResponse.json([], { status: 200 });
    }

    // Find the current user
    const currentUser = await User.findOne({ clerkId: userId });

    // Get search query
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Build query
    const query: any = { _id: { $ne: currentUser?._id } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query, 'name username profilePicture').limit(limit);

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}