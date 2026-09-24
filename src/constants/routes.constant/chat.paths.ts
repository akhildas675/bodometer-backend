export const CHAT_PATHS = {
  ROOT: "/",
  CONVERSATIONS: "/conversations",
  CONVERSATION_MESSAGES: "/conversations/:conversationId/messages",
  MESSAGES: "/:conversationId/messages",
  UPLOAD_ATTACHMENT: "/upload-attachment",
} as const;
