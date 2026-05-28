"use client";
import styles from "./page.module.css";
import { CommentForm } from "@/components/comments/CommentForm";
import { Paginations } from "@/components/Paginations";
import { PreviewModal } from "@/components/PreviewModal";
import { CommentsTable } from "@/components/comments/CommentsTable";
import { useComments } from "@/hooks/useComments";
export default function Home() {
  const {
    comments,
    pagination,
    isLoading,
    error,
    submitComment,
    changeSort,
    changePage,
  } = useComments();
  return (
    <div className={styles.page}>
      <CommentForm
        onSubmit={submitComment}
        onPreview={() => {}}
        loading={isLoading}
        error={error}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <CommentsTable
        comments={comments}
        sortBy="createdAt"
        sortOrder="desc"
        onSort={(field) =>
          changeSort(field as "username" | "email" | "createdAt")
        }
        onReply={() => {}}
      />
      <Paginations
        totalPages={pagination.totalPages}
        currentPage={pagination.page}
        onPageChange={changePage}
      />
      <PreviewModal html="" onClose={() => {}} isOpen={false} />
    </div>
  );
}
