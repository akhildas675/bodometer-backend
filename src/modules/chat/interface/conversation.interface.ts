import { Role } from "@/constants/constant.values.ts/roles";
import { Message } from "./message.interface";

export interface ParticipantDetails {
  id: string;
  name: string;
  role: Role;
  profilePic?: string | null;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageId?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedConversation extends Conversation {
  participants?: ParticipantDetails[];
  lastMessage?: Message | null;
}

export interface CreateConversation {
  participantIds: string[];
}