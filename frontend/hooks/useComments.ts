"use client";
import { useState, useEffect } from "react";
import { Comment, CreateComment, Pagination } from "@/types";
import {
  createComment,
  createReply,
  deleteComment,
  getComments,
  getReplies,
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [repliesByParent, setRepliesByParent] = useState<
    Record<string, Comment[]>
  >({});

  const fetchReplies = async (parentId: string) => {
    try {
      const res = await getReplies(parentId);
      setRepliesByParent((prev) => ({ ...prev, [parentId]: res }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get replies";
      setError(message);
    }
  };
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
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await createReply(parentId, comment);
      if (file && res?.id) {
        await uploadAttachment(res.id, file);
      }
      await fetchReplies(parentId);
      await fetchComments();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create reply";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changeSort = (field: "username" | "email" | "createdAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const removeComment = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setRepliesByParent((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = next[key].filter((reply) => reply.id !== id);
        }
        return next;
      });
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete comment";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePage = (page: number) => {
    setPage(page);
  };

  useSocket((newComment) => {
    setComments((prev) => [newComment, ...prev]);
  });

  useEffect(() => {
    const fetchCommentsEffect = async () => {
      await fetchComments();
    };
    fetchCommentsEffect();
  }, [page, sortBy, sortOrder]);

  return {
    comments,
    pagination,
    page,
    sortBy,
    sortOrder,
    repliesByParent,
    isLoading,
    error,
    submitComment,
    submitReply,
    fetchReplies,
    removeComment,
    changeSort,
    changePage,
  };
}
