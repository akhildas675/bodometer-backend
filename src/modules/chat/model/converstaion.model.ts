import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  participantIds: mongoose.Types.ObjectId[];
  lastMessageId?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participantIds: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      index: true,
    },

    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ConversationModel = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);