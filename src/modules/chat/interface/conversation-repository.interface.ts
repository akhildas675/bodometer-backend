import {
  Conversation,
  CreateConversation,
  PopulatedConversation,
} from "./conversation.interface";

export interface IConversationRepository {
  createConversation(
    data: CreateConversation,
  ): Promise<Conversation>;

  findById(id: string): Promise<Conversation | null>;

  findByParticipant(
    participantId: string,
  ): Promise<Conversation[]>;

  findByParticipants(
    participantIds: string[],
  ): Promise<Conversation | null>;

  findByParticipantWithDetails(
    participantId: string,
  ): Promise<PopulatedConversation[]>;

  findByParticipantsWithDetails(
    participantIds: string[],
  ): Promise<PopulatedConversation | null>;

  updateLastMessage(
    conversationId: string,
    messageId: string,
    lastMessageAt: Date,
  ): Promise<Conversation>;
}