import { z } from "zod";
import { CHAT_TYPE } from "../constant/chat.constant";

export const chatConversationIdSocketSchema = z.string().min(1);

export const chatSendMessageSocketSchema = z.object({
  conversationId: z.string().min(1),

  content: z.string().trim().min(1).max(5000, "Message content must not exceed 5000 characters"),

  messageType: z.enum([
    CHAT_TYPE.TEXT,
    CHAT_TYPE.IMAGE,
    CHAT_TYPE.DOCUMENT,
  ]),
});