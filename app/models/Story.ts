import mongoose, { Schema, models, Document } from "mongoose";

export interface IStory extends Document {
  user: Schema.Types.ObjectId;
  image: string;
  createdAt: Date;
}

const StorySchema = new Schema<IStory>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "24h", // Automatically delete after 24 hours
  },
});

const Story = models.Story || mongoose.model<IStory>("Story", StorySchema);

export default Story; 