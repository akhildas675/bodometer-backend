import { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { authenticateSocket } from "./socket.auth";
import { AuthenticatedSocket } from "./socket.types";

import { registerVideoSessionSocketHandlers } from "@/modules/video-session/socket/video-session.socket";

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

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const user = socket.data?.user;

  if (!user) return;

  const { userId, role } = user;

  console.log(
    `Socket connected: ${socket.id} | User: ${userId} | Role: ${role}`,
  );

  void socket.join(`user:${userId}`);

  registerVideoSessionSocketHandlers(socket);
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