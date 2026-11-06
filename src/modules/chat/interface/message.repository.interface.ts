import { CreateMessage, Message } from "./message.interface";

export interface IMessageRepository {
  createMessage(data: CreateMessage): Promise<Message>;

  findById(id: string): Promise<Message | null>;

  findByConversation(conversationId: string, options?: { limit?: number; skip?: number }): Promise<Message[]>;

  countByConversation(conversationId: string): Promise<number>;

  markMessagesAsRead(
    conversationId: string,
    receiverId: string,
  ): Promise<number>;
}