import {
  ConversationResponseDto,
  MessageResponseDto,
} from "../dto/chat.dto";

import {
  Conversation,
  PopulatedConversation,
} from "../interface/conversation.interface";
import { Message } from "../interface/message.interface";

export class ChatMapper {
  static toConversationResponseDto(
    conversation: Conversation | PopulatedConversation,
  ): ConversationResponseDto {
    const populated = conversation as PopulatedConversation;

    return {
      id: conversation.id,
      participantIds: conversation.participantIds,
      participants: populated.participants?.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        profilePic: p.profilePic,
      })),
      lastMessageId: conversation.lastMessageId,
      lastMessageAt: conversation.lastMessageAt,
      lastMessage: populated.lastMessage
        ? ChatMapper.toMessageResponseDto(populated.lastMessage)
        : null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  static toMessageResponseDto(
    message: Message,
  ): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      messageType: message.messageType,
      isRead: message.isRead ?? false,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}