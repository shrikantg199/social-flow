import mongoose, { Schema, models, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  text: string;
  read: boolean;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message; 