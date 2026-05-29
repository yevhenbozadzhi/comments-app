import { Server } from "socket.io";

let io = null;

export function initSocket(httpServer) {
  const defaultOrigins = ["http://localhost:3000", "http://localhost:5173"];
  const origins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : defaultOrigins;

  io = new Server(httpServer, {
    cors: {
      origin: origins,
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
