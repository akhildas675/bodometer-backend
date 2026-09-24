import { Router } from "express";
import container from "@/container/container";
import { validate } from "@/middleware/validate";
import { mediaUpload } from "@/config/multer";
import { ChatController } from "../controller/chat.controller";
import { CHAT_TYPES } from "../chat.types";
import { CHAT_PATHS } from "@/constants/routes.constant/chat.paths";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import { requireActiveSubscription } from "@/middleware/subscriptionGuard";
import {
  createConversationSchema,
  getConversationsSchema,
  getConversationMessagesSchema,
  sendMessageSchema,
} from "../validation/chat.validation";

const chatRoute = Router();

const chatController = container.get<ChatController>(
  CHAT_TYPES.ChatController,
);


chatRoute.use(ROLE_GUARD.USER_TRAINER_GUARD, requireActiveSubscription);


chatRoute.post(
  CHAT_PATHS.CONVERSATIONS,
  validate(createConversationSchema),
  chatController.createConversation,
);
chatRoute.post(
  CHAT_PATHS.ROOT,
  validate(createConversationSchema),
  chatController.createConversation,
);


chatRoute.get(
  CHAT_PATHS.CONVERSATIONS,
  validate(getConversationsSchema),
  chatController.getConversations,
);
chatRoute.get(
  CHAT_PATHS.ROOT,
  validate(getConversationsSchema),
  chatController.getConversations,
);


chatRoute.get(
  CHAT_PATHS.CONVERSATION_MESSAGES,
  validate(getConversationMessagesSchema),
  chatController.getConversationMessages,
);
chatRoute.get(
  CHAT_PATHS.MESSAGES,
  validate(getConversationMessagesSchema),
  chatController.getConversationMessages,
);


chatRoute.post(
  CHAT_PATHS.CONVERSATION_MESSAGES,
  validate(sendMessageSchema),
  chatController.sendMessage,
);
chatRoute.post(
  CHAT_PATHS.MESSAGES,
  validate(sendMessageSchema),
  chatController.sendMessage,
);

chatRoute.post(
  CHAT_PATHS.UPLOAD_ATTACHMENT,
  mediaUpload.single("file"),
  chatController.uploadAttachment,
);

export default chatRoute;
