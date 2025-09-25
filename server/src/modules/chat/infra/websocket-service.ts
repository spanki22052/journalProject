import { Server as SocketIOServer } from "socket.io";
import { WebSocketService } from "../domain/ports";

export class SocketIOWebSocketService implements WebSocketService {
  constructor(private io: SocketIOServer) {}

  emitToRoom(roomId: string, event: string, data: any): void {
    this.io.to(roomId).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any): void {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  joinRoom(userId: string, roomId: string): void {
    const socket = this.io.sockets.sockets.get(userId);
    if (socket) {
      socket.join(roomId);
    }
  }

  leaveRoom(userId: string, roomId: string): void {
    const socket = this.io.sockets.sockets.get(userId);
    if (socket) {
      socket.leave(roomId);
    }
  }
}
