import mongoose, { Schema, models, Document } from "mongoose";

export interface IConversation extends Document {
  participants: Schema.Types.ObjectId[];
  lastMessageAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation =
  models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation; 