import { Server } from "socket.io";

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}