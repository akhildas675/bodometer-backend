import { inject, injectable } from "inversify";
import { IChatService } from "../interface/chat-service.interface";
import { CHAT_TYPES } from "../chat.types";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";
import { ITrainerService } from "@/modules/trainer/interface/trainer-service.interface";
import { IConversationRepository } from "../interface/conversation-repository.interface";
import { IMessageRepository } from "../interface/message.repository.interface";
import { IS3Service } from "@/modules/s3/interface/s3-service.interface";
import { CHAT_TYPE } from "../constant/chat.constant";
import {
  ChatAttachmentResponseDto,
  ConversationResponseDto,
  MessageResponseDto,
  SendMessageDto,
} from "../dto/chat.dto";
import { ChatMapper } from "../mapper/chat.mapper";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(CHAT_TYPES.ConversationRepository)
    private _conversationRepository: IConversationRepository,
    @inject(CHAT_TYPES.MessageRepository)
    private _messageRepository: IMessageRepository,
    @inject(TRAINER_TYPES.TrainerService)
    private _trainerService: ITrainerService,
    @inject(CHAT_TYPES.S3Service)
    private _s3Service: IS3Service,
  ) {}

  async getOrCreateConversation(
    userId: string,
    targetTrainerId: string,
  ): Promise<ConversationResponseDto> {
    let resolvedTrainerId = targetTrainerId;
    try {
      const detail =
        await this._trainerService.getTrainerDetail(targetTrainerId);
      if (detail?.userId) {
        resolvedTrainerId = detail.userId.toString();
      }
    } catch {
      // Keep original targetTrainerId if lookup fails
    }

    let conversation =
      await this._conversationRepository.findByParticipantsWithDetails([
        userId,
        resolvedTrainerId,
      ]);

    if (!conversation) {
      const created = await this._conversationRepository.createConversation({
        participantIds: [userId, resolvedTrainerId],
      });
      conversation =
        (await this._conversationRepository.findByParticipantsWithDetails([
          userId,
          resolvedTrainerId,
        ])) || created;
    }

    return ChatMapper.toConversationResponseDto(conversation);
  }

  async getUserConversations(
    userId: string,
  ): Promise<ConversationResponseDto[]> {
    const conversations =
      await this._conversationRepository.findByParticipantWithDetails(userId);

    return conversations.map((conversation) =>
      ChatMapper.toConversationResponseDto(conversation),
    );
  }

  async sendMessage(
    data: SendMessageDto,
    senderId: string,
  ): Promise<MessageResponseDto> {
    const conversation =
      await this._conversationRepository.findById(data.conversationId);

    if (!conversation) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
      );
    }

    const isParticipant = conversation.participantIds.includes(senderId);

    if (!isParticipant) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.CHAT.NOT_PARTICIPANT,
      );
    }

    const receiverId = conversation.participantIds.find(
      (participantId) => participantId !== senderId,
    );

    if (!receiverId) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.MESSAGE.INVALID_TYPE,
      );
    }

    const message = await this._messageRepository.createMessage({
      conversationId: data.conversationId,
      senderId,
      receiverId,
      content: data.content,
      messageType: data.messageType,
    });

    await this._conversationRepository.updateLastMessage(
      data.conversationId,
      message.id,
      message.createdAt,
    );

    return ChatMapper.toMessageResponseDto(message);
  }

  async getConversationMessages(
    conversationId: string,
    participantId: string,
  ): Promise<MessageResponseDto[]> {
    await this.validateParticipant(conversationId, participantId);

    await this._messageRepository.markMessagesAsRead(
      conversationId,
      participantId,
    );

    const messages =
      await this._messageRepository.findByConversation(conversationId);

    return messages.map((message) =>
      ChatMapper.toMessageResponseDto(message),
    );
  }

  async markConversationAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await this.validateParticipant(conversationId, userId);
    await this._messageRepository.markMessagesAsRead(conversationId, userId);
  }

  async validateParticipant(
    conversationId: string,
    participantId: string,
  ): Promise<void> {
    const conversation =
      await this._conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
      );
    }

    const isParticipant =
      conversation.participantIds.includes(participantId);

    if (!isParticipant) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.CHAT.NOT_PARTICIPANT,
      );
    }
  }

  async uploadAttachment(
    file: Express.Multer.File,
  ): Promise<ChatAttachmentResponseDto> {
    if (!file) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.CHAT.ATTACHMENT_REQUIRED,
      );
    }

    const isImage = file.mimetype.startsWith("image/");
    const allowedDocs = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const isDoc = allowedDocs.includes(file.mimetype);

    if (!isImage && !isDoc) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.CHAT.INVALID_FILE_TYPE,
      );
    }

    const folder = isImage ? "chat/images" : "chat/documents";
    const fileUrl = await this._s3Service.uploadFile(file, folder);
    const messageType = isImage ? CHAT_TYPE.IMAGE : CHAT_TYPE.DOCUMENT;

    return {
      fileUrl,
      messageType,
      fileName: file.originalname,
      fileSize: file.size,
    };
  }
}