"use client";

import styles from "./page.module.css";
import { Paginations } from "@/components/Paginations";
import { PreviewModal } from "@/components/PreviewModal";
import { CommentsFeed } from "@/components/comments/CommentsFeed";
import { useComments } from "@/hooks/useComments";
import { useState } from "react";
import { Header } from "@/components/Header";
import { CommentsTable } from "@/components/comments/CommentsTable";
import { PreviewComment } from "@/types";
import { previewComment } from "@/lib/api";

export default function Home() {
  const {
    comments,
    pagination,
    isLoading,
    error,
    submitComment,
    submitReply,
    fetchReplies,
    repliesByParent,
    changePage,
    changeSort,
    sortBy,
    sortOrder,
    removeComment,
  } = useComments();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleNewPostSubmit = async (
    ...args: Parameters<typeof submitComment>
  ) => {
    const ok = await submitComment(...args);
    if (ok) {
      setIsFormOpen(false);
    }
    return ok;
  };

  const handleReplySubmit = async (
    parentId: string,
    ...args: Parameters<typeof submitComment>
  ) => {
    const ok = await submitReply(parentId, ...args);
    return ok;
  };

  const handlePreview = async (comment: PreviewComment) => {
    setPreviewError(null);
    try {
      const data = await previewComment(comment);
      setPreviewHtml(data.html);
      setPreviewOpen(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to preview comment";
      setPreviewError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this comment?")) {
      return;
    }
    await removeComment(id);
  };

  return (
    <div className={styles.page}>
      <Header
        isFormOpen={isFormOpen}
        onToggleForm={() => setIsFormOpen((value) => !value)}
        onSubmit={handleNewPostSubmit}
        onPreview={handlePreview}
        loading={isLoading}
        error={error}
      />

      {error ? <p className={styles.error}>{error}</p> : null}
      {previewError ? <p className={styles.error}>{previewError}</p> : null}

      <CommentsTable
        comments={comments}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(field) =>
          changeSort(field as "username" | "email" | "createdAt")
        }
      />

      <CommentsFeed
        comments={comments}
        replyId={replyId}
        repliesByParent={repliesByParent}
        onLoadReplies={fetchReplies}
        onReply={(id) => {
          setReplyId(id);
          setIsFormOpen(false);
          fetchReplies(id);
        }}
        onCancelReply={() => setReplyId(null)}
        onSubmitReply={handleReplySubmit}
        onDelete={handleDelete}
        isLoading={isLoading}
        error={error}
      />

      <div className={styles.pagination}>
        <Paginations
          totalPages={pagination.totalPages}
          currentPage={pagination.page}
          onPageChange={changePage}
        />
      </div>

      <PreviewModal
        html={previewHtml}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
