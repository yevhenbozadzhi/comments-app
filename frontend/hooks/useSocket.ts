"use client";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { Comment } from "@/types";

export function useSocket(onNewComment: (newComment: Comment) => void) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    socket.on("connect", () => {
      console.log("connected to socket", socket.id);
    });
    socket.on("newComment", (comment: Comment) => {
      onNewComment(comment);
    });
    socket.on("disconnect", () => {
      console.log("disconnected from socket");
    });
    return () => {
      socket.disconnect();
    };
  }, [onNewComment]);
}
