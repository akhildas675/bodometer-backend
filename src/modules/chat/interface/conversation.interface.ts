import mongoose from "mongoose";

export interface Conversation{
  id:mongoose.Types.ObjectId;
  participantIds:mongoose.Types.ObjectId;
  lastMessageId?:string;
  lastMessageAt?:string;
  createdAt:Date;
  updatedAt:Date;
}