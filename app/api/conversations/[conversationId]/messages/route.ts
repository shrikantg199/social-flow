import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import connectDB from "@/lib/database";
import User from "@/app/models/User";
import Message from "@/app/models/Message";
import Conversation from "@/app/models/Conversation";

// Get all messages for a conversation
export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    const messages = await Message.find({
      conversationId: params.conversationId,
    })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: 1 });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Send a new message
export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
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

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const newMessage = new Message({
      conversationId: params.conversationId,
      sender: currentUser._id,
      text,
    });

    await newMessage.save();

    // Also update the last message time in the conversation
    await Conversation.findByIdAndUpdate(params.conversationId, {
      lastMessageAt: new Date(),
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name profilePicture"
    );

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 