import mongoose, { Document, Schema } from "mongoose";
import { Role } from "@/constants/constant.values.ts/roles";
import { ChatType } from "../constant/chat.constant";

export interface IPopulatedUserDoc {
  _id: mongoose.Types.ObjectId | string;
  name?: string;
  role: Role;
  profilePic?: string | null;
}

export interface IPopulatedMessageDoc {
  _id: mongoose.Types.ObjectId | string;
  senderId?: mongoose.Types.ObjectId | string;
  receiverId?: mongoose.Types.ObjectId | string;
  content?: string;
  messageType: ChatType;
  isRead?: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  participantIds: mongoose.Types.ObjectId[];
  lastMessageId?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPopulatedConversationDoc
  extends Omit<IConversation, "participantIds" | "lastMessageId"> {
  participantIds: Array<IPopulatedUserDoc | mongoose.Types.ObjectId>;
  lastMessageId?: IPopulatedMessageDoc | mongoose.Types.ObjectId;
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