import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import connectDB from "@/lib/database";
import User from "@/app/models/User";
import Conversation from "@/app/models/Conversation";

// Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const conversations = await Conversation.find({
      participants: currentUser._id,
    })
      .populate({
        path: "participants",
        select: "name profilePicture",
      })
      .sort({ lastMessageAt: -1 });

    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { recipientId } = await req.json();
    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    const existingConversation = await Conversation.findOne({
      participants: { $all: [currentUser._id, recipientId] },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation, { status: 200 });
    }

    const newConversation = new Conversation({
      participants: [currentUser._id, recipientId],
    });

    await newConversation.save();
    return NextResponse.json(newConversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 