import { Container } from "inversify";

import { IChatService } from "./interface/chat-service.interface";
import { IConversationRepository } from "./interface/conversation-repository.interface";
import { IMessageRepository } from "./interface/message.repository.interface";
import { IS3Service } from "@/modules/s3/interface/s3-service.interface";
import { S3Service } from "@/services/s3/s3.service";

import { ChatService } from "./service/chat.service";
import ConversationRepository from "./repository/conversation.repository";
import MessageRepository from "./repository/message.repository";
import { ChatController } from "./controller/chat.controller";

import { CHAT_TYPES } from "./chat.types";

export const loadChatBindings = (container: Container): void => {
  container
    .bind<IConversationRepository>(
      CHAT_TYPES.ConversationRepository,
    )
    .to(ConversationRepository);

  container
    .bind<IMessageRepository>(
      CHAT_TYPES.MessageRepository,
    )
    .to(MessageRepository);

  container
    .bind<IS3Service>(
      CHAT_TYPES.S3Service,
    )
    .to(S3Service);

  container
    .bind<IChatService>(
      CHAT_TYPES.ChatService,
    )
    .to(ChatService);

  container
    .bind<ChatController>(
      CHAT_TYPES.ChatController,
    )
    .to(ChatController);
};