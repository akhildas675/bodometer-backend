import container from "@/container/container";
import { AuthenticatedSocket } from "@/infrastructure/socket/socket.types";
import { getSocketIO } from "@/infrastructure/socket/socket.server";
import { IChatService } from "../interface/chat-service.interface";
import { CHAT_TYPES } from "../chat.types";
import { SUBSCRIPTION_TYPES } from "@/modules/subscription/subscription.types";
import { ISubscriptionService } from "@/modules/subscription/interface/subscription-interface.service";
import { ROLES } from "@/constants/constant.values.ts/roles";
import { MESSAGES } from "@/constants/messages";
import {
  chatConversationIdSocketSchema,
  chatSendMessageSocketSchema,
} from "../validation/chat.socket.validation";

export const registerChatSocketHandlers = (
  socket: AuthenticatedSocket,
): void => {
  const user = socket.data?.user;

  if (!user) {
    return;
  }

  const { userId, role } = user;

  const chatService = container.get<IChatService>(
    CHAT_TYPES.ChatService,
  );

  const subscriptionService = container.get<ISubscriptionService>(
    SUBSCRIPTION_TYPES.Service,
  );

  const verifySubscription = async (): Promise<boolean> => {
    if (role !== ROLES.USER) {
      return true;
    }
    const activeSub = await subscriptionService.getActiveSubscription(userId);
    return !!activeSub;
  };

  socket.on("chat:join", async (conversationId: string) => {
    try {
      if (!(await verifySubscription())) {
        socket.emit("chat:error", {
          event: "chat:join",
          message: MESSAGES.CHAT.SUBSCRIPTION_REQUIRED,
        });
        return;
      }

      const validatedConversationId =
        chatConversationIdSocketSchema.parse(conversationId);

      await chatService.validateParticipant(
        validatedConversationId,
        userId,
      );

      const room = `chat:conversation:${validatedConversationId}`;

      await socket.join(room);

      await chatService.markConversationAsRead(
        validatedConversationId,
        userId,
      );

      socket.emit("chat:joined", {
        conversationId: validatedConversationId,
      });

      try {
        const io = getSocketIO();
        io.to(room).emit("chat:seen", {
          conversationId: validatedConversationId,
          readerId: userId,
          readAt: new Date().toISOString(),
        });
      } catch {
        // Socket instance error
      }
    } catch (error) {
      socket.emit("chat:error", {
        event: "chat:join",
        message:
          error instanceof Error
            ? error.message
            : "Failed to join conversation.",
      });
    }
  });

  socket.on("chat:read", async (conversationId: string) => {
    try {
      const validatedConversationId =
        chatConversationIdSocketSchema.parse(conversationId);

      await chatService.markConversationAsRead(
        validatedConversationId,
        userId,
      );

      const room = `chat:conversation:${validatedConversationId}`;
      const io = getSocketIO();
      io.to(room).emit("chat:seen", {
        conversationId: validatedConversationId,
        readerId: userId,
        readAt: new Date().toISOString(),
      });
    } catch {
      // Ignore read error
    }
  });

  socket.on("chat:leave", async (conversationId: string) => {
    try {
      const validatedConversationId =
        chatConversationIdSocketSchema.parse(conversationId);

      const room = `chat:conversation:${validatedConversationId}`;

      await socket.leave(room);

      socket.emit("chat:left", {
        conversationId: validatedConversationId,
      });
    } catch (error) {
      socket.emit("chat:error", {
        event: "chat:leave",
        message:
          error instanceof Error
            ? error.message
            : "Failed to leave conversation.",
      });
    }
  });

  socket.on("chat:send", async (payload: unknown) => {
    try {
      if (!(await verifySubscription())) {
        socket.emit("chat:error", {
          event: "chat:send",
          message: MESSAGES.CHAT.SUBSCRIPTION_REQUIRED,
        });
        return;
      }

      const validatedPayload =
        chatSendMessageSocketSchema.parse(payload);

      const message = await chatService.sendMessage(
        validatedPayload,
        userId,
      );

      const room = `chat:conversation:${validatedPayload.conversationId}`;

  
      socket.to(room).emit("chat:message", message);

   
      socket.emit("chat:sent", message);

      
      if (message.receiverId) {
        try {
          const io = getSocketIO();
          io.to(`user:${message.receiverId}`).emit("chat:notification", {
            conversationId: validatedPayload.conversationId,
            message,
          });
        } catch {
          // Socket instance not initialized
        }
      }
    } catch (error) {
      socket.emit("chat:error", {
        event: "chat:send",
        message:
          error instanceof Error
            ? error.message
            : "Failed to send message.",
      });
    }
  });

  socket.on("disconnect", () => {
    // Not required here initial 
  });
};