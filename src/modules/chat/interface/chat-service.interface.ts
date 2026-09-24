import {
  ChatAttachmentResponseDto,
  ConversationResponseDto,
  MessageResponseDto,
  SendMessageDto,
} from "../dto/chat.dto";

export interface IChatService {
  getOrCreateConversation(
    userId: string,
    trainerId: string
  ): Promise<ConversationResponseDto>;

  getUserConversations(
    userId: string
  ): Promise<ConversationResponseDto[]>;

  sendMessage(
    data: SendMessageDto,
    senderId: string
  ): Promise<MessageResponseDto>;

  getConversationMessages(
    conversationId: string,
    participantId: string
  ): Promise<MessageResponseDto[]>;

  validateParticipant(
    conversationId: string,
    participantId: string
  ): Promise<void>;

  markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<void>;

  uploadAttachment(
    file: Express.Multer.File,
  ): Promise<ChatAttachmentResponseDto>;
}