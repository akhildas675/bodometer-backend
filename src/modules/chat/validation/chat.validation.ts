import { z } from "zod";
import { MESSAGES } from "@/constants/messages";
import { CHAT_TYPE } from "../constant/chat.constant";


export const createConversationSchema = z.object({
  body: z.object({
    trainerId: z
      .string()
      .trim()
      .min(1, MESSAGES.CHAT.TRAINER_ID_REQUIRED),
  }),
});


export const conversationIdParamSchema = z.object({
  params: z.object({
    conversationId: z
      .string()
      .trim()
      .min(1, MESSAGES.CHAT.CONVERSATION_ID_REQUIRED),
  }),
});


export const getConversationMessagesSchema = z.object({
  params: z.object({
    conversationId: z
      .string()
      .trim()
      .min(1, MESSAGES.CHAT.CONVERSATION_ID_REQUIRED),
  }),
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .optional(),
});


export const sendMessageSchema = z.object({
  params: z.object({
    conversationId: z
      .string()
      .trim()
      .min(1, MESSAGES.CHAT.CONVERSATION_ID_REQUIRED),
  }),
  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, MESSAGES.CHAT.MESSAGE_CONTENT_REQUIRED),
    messageType: z.nativeEnum(CHAT_TYPE, {
      message: MESSAGES.CHAT.INVALID_MESSAGE_TYPE,
    }),
  }),
});


export const getConversationsSchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .optional(),
});


export const chatAttachmentSchema = z.object({
  file: z
    .object({
      mimetype: z.string().refine(
        (val) =>
          [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].includes(val),
        { message: MESSAGES.CHAT.INVALID_FILE_TYPE },
      ),
      size: z
        .number()
        .max(10 * 1024 * 1024, MESSAGES.CHAT.ATTACHMENT_TOO_LARGE),
    })
    .refine((file) => file !== undefined, {
      message: MESSAGES.CHAT.ATTACHMENT_REQUIRED,
    }),
});


export const socketSendMessageSchema = z.object({
  conversationId: z
    .string()
    .trim()
    .min(1, MESSAGES.CHAT.CONVERSATION_ID_REQUIRED),
  content: z
    .string()
    .trim()
    .min(1, MESSAGES.CHAT.MESSAGE_CONTENT_REQUIRED),
  messageType: z.nativeEnum(CHAT_TYPE, {
    message: MESSAGES.CHAT.INVALID_MESSAGE_TYPE,
  }),
});

export const socketJoinConversationSchema = z.object({
  conversationId: z
    .string()
    .trim()
    .min(1, MESSAGES.CHAT.CONVERSATION_ID_REQUIRED),
});

export const socketTypingSchema = z.object({
  conversationId: z
    .string()
    .trim()
    .min(1, MESSAGES.CHAT.CONVERSATION_ID_REQUIRED),
  isTyping: z.boolean(),
});


export const createConversationBodySchema = createConversationSchema.shape.body;
export const sendMessageBodySchema = sendMessageSchema.shape.body;
export const conversationParamsSchema = conversationIdParamSchema.shape.params;


export type CreateConversationSchema = z.infer<typeof createConversationSchema>;
export type SendMessageSchema = z.infer<typeof sendMessageSchema>;
export type GetConversationMessagesSchema = z.infer<typeof getConversationMessagesSchema>;
export type SocketSendMessageInput = z.infer<typeof socketSendMessageSchema>;
export type SocketJoinConversationInput = z.infer<typeof socketJoinConversationSchema>;
export type SocketTypingInput = z.infer<typeof socketTypingSchema>;
