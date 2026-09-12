import { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { authenticateSocket } from "./socket.auth";
import { SocketUser } from "./socket.types";

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

  io.on("connection", (socket) => {
  const user = socket.data.user as SocketUser;

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