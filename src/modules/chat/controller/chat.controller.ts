import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";

import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";

import { CHAT_TYPES } from "../chat.types";
import { IChatService } from "../interface/chat-service.interface";
import {
  CreateConversationDto,
  SendMessageDto,
} from "../dto/chat.dto";

@injectable()
export class ChatController {
  constructor(
    @inject(CHAT_TYPES.ChatService)
    private _chatService: IChatService,
  ) {}

  createConversation = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      const { trainerId } = req.body as CreateConversationDto;

      if (!userId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.UNAUTHORIZED,
        );
      }

      if (!trainerId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.CHAT.TRAINER_ID_REQUIRED,
        );
      }

      const result =
        await this._chatService.getOrCreateConversation(
          userId,
          trainerId,
        );

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.CHAT.CONVERSATION_CREATED,
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getConversations = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.UNAUTHORIZED,
        );
      }

      const result =
        await this._chatService.getUserConversations(userId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.CHAT.CONVERSATIONS_FETCHED,
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getConversationMessages = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const participantId = req.user?.id;
      const { conversationId } = req.params;

      if (!participantId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.UNAUTHORIZED,
        );
      }

      if (!conversationId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.CHAT.CONVERSATION_ID_REQUIRED,
        );
      }

      const result =
        await this._chatService.getConversationMessages(
          conversationId,
          participantId,
        );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.CHAT.MESSAGES_FETCHED,
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  sendMessage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const senderId = req.user?.id;
      const { conversationId } = req.params;

      const body = req.body as Omit<
        SendMessageDto,
        "conversationId"
      >;

      if (!senderId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.UNAUTHORIZED,
        );
      }

      if (!conversationId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.CHAT.CONVERSATION_ID_REQUIRED,
        );
      }

      const data: SendMessageDto = {
        conversationId,
        content: body.content,
        messageType: body.messageType,
      };

      const result =
        await this._chatService.sendMessage(
          data,
          senderId,
        );

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.CHAT.MESSAGE_SENT,
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  uploadAttachment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const file = req.file;
      if (!file) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.CHAT.ATTACHMENT_REQUIRED,
        );
      }

      const result = await this._chatService.uploadAttachment(file);

      new SuccessResponse(
        STATUS.CREATED,
        "Attachment uploaded successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}