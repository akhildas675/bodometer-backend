import { ChatType } from "../constant/chat.constant";
import { Role } from "@/constants/constant.values.ts/roles";

export interface CreateConversationDto {
  trainerId: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
  messageType: ChatType;
}

export interface ParticipantDto {
  id: string;
  name: string;
  role: Role;
  profilePic?: string | null;
}

export interface ConversationResponseDto {
  id: string;
  participantIds: string[];
  participants?: ParticipantDto[];
  lastMessageId?: string;
  lastMessageAt?: Date;
  lastMessage?: MessageResponseDto | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageResponseDto {
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

export interface ChatAttachmentResponseDto {
  fileUrl: string;
  messageType: ChatType;
  fileName: string;
  fileSize: number;
}