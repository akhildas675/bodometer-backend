import { getSocketIO } from "./socket.server";

export class SocketManager {

  static emitToUser(userId: string, event: string, payload: unknown): void {
    try {
      const io = getSocketIO();
      io.to(`user:${userId}`).emit(event, payload);
    } catch (error) {
      console.error(`Failed to emit event '${event}' to user '${userId}':`, error);
    }
  }

 
  static emitToRoom(room: string, event: string, payload: unknown): void {
    try {
      const io = getSocketIO();
      io.to(room).emit(event, payload);
    } catch (error) {
      console.error(`Failed to emit event '${event}' to room '${room}':`, error);
    }
  }


  static broadcast(event: string, payload: unknown): void {
    try {
      const io = getSocketIO();
      io.emit(event, payload);
    } catch (error) {
      console.error(`Failed to broadcast event '${event}':`, error);
    }
  }
}
