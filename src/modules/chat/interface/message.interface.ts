import { ChatType } from "../constant/chat.constant";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: ChatType;
  isRead?: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessage {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: ChatType;
}