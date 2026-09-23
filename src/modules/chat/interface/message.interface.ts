import mongoose from "mongoose";

export interface Message{
  id:mongoose.Types.ObjectId;
  conversationId:mongoose.Types.ObjectId;
  senderId:string;
  receiverId:string;
  content:string;
  messageType:string;
  createdAt:Date;
  updatedAt:Date;
  

}