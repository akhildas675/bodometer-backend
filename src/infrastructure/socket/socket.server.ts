import { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { authenticateSocket } from "./socket.auth";
import { SocketUser } from "./socket.types";

let io: Server;

export const initializeSocket = (
  httpServer: HttpServer,
): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || true,
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser;
    if (!user) return;
    const { userId, role } = user;

    console.log(
      `Socket connected: ${socket.id} | User: ${userId} | Role: ${role}`,
    );

    void socket.join(`user:${userId}`);

    
    socket.on("video:join-room", (bookingId: string) => {
      const room = `video:${bookingId}`;
      void socket.join(room);
      console.log(`User ${userId} (${role}) joined video room: ${room}`);
      socket.to(room).emit("video:participant-joined", { participantId: userId, role });
    });

    socket.on("video:leave-room", (bookingId: string) => {
      const room = `video:${bookingId}`;
      void socket.leave(room);
      console.log(`User ${userId} left video room: ${room}`);
      socket.to(room).emit("video:participant-left", { participantId: userId, role });
    });

    socket.on("video:offer", ({ bookingId, offer }: { bookingId: string; offer: unknown }) => {
      const room = `video:${bookingId}`;
      socket.to(room).emit("video:offer", { senderId: userId, offer });
    });

    socket.on("video:answer", ({ bookingId, answer }: { bookingId: string; answer: unknown }) => {
      const room = `video:${bookingId}`;
      socket.to(room).emit("video:answer", { senderId: userId, answer });
    });

    socket.on("video:ice-candidate", ({ bookingId, candidate }: { bookingId: string; candidate: unknown }) => {
      const room = `video:${bookingId}`;
      socket.to(room).emit("video:ice-candidate", { senderId: userId, candidate });
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${socket.id} | User: ${userId} | Reason: ${reason}`,
      );
    });
  });

  return io;
};

export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized",
    );
  }

  return io;
};