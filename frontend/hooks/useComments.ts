"use client";
import { useState, useEffect } from "react";
import { Comment, CreateComment, Pagination } from "@/types";
import {
  createComment,
  createReply,
  getComments,
  uploadAttachment,
} from "@/lib/api";
import { useSocket } from "./useSocket";

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await getComments(page, sortBy, sortOrder);
      setComments(res.comments);
      setPagination(res.pagination);
    } catch (error) {
      setError((error as { message: string }).message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitComment = async (
    comment: CreateComment,
    file?: File,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const commentRes = await createComment(comment);
      if (file) {
        await uploadAttachment(commentRes.id, file);
      }
      await fetchComments();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create comment";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitReply = async (
    parentId: string,
    comment: CreateComment,
    file?: File,
  ) => {
    setIsLoading(true);
    try {
      const res = await createReply(parentId, comment);
      setReplies((prev) => [res as Comment, ...prev]);
      await fetchComments();
    } catch (error) {
      setError((error as { message: string }).message);
    } finally {
      setIsLoading(false);
    }
  };

  const changeSort = (field: "username" | "email" | "createdAt") => {
    setSortBy(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setPage(1);
  };

  const changePage = (page: number) => {
    setPage(page);
  };

  useSocket((newComment) => {
    setComments((prev) => [newComment, ...prev]);
  });

  useEffect(() => {
    fetchComments();
  }, [page, sortBy, sortOrder]);

  return {
    comments,
    pagination,
    page,
    sortBy,
    sortOrder,
    replies,
    isLoading,
    error,
    submitComment,
    submitReply,
    changeSort,
    changePage,
  };
}
