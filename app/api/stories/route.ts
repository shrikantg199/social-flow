import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import connectDB from "@/lib/database";
import Story from "@/app/models/Story";
import User from "@/app/models/User";

// Get stories
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query = {};
    if (userId) {
      query = { user: userId };
    }

    const stories = await Story.find(query)
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });
    return NextResponse.json(stories, { status: 200 });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new story
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const newStory = new Story({
      user: user._id,
      image,
    });

    await newStory.save();
    return NextResponse.json(newStory, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 