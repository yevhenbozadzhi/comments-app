"use client";

import { Comment } from "../../types";
import { Button } from "../button/Button";
import styles from "./CommentItem.module.css";
import { useEffect } from "react";

type CommentItemProps = {
  comment: Comment;
  onReply: (commentId: string) => void;
  onShowReplies?: () => void;
  showRepliesButton?: boolean;
  nested?: boolean;
  replyTo?: string;
  onDelete?: (commentId: string) => void;
  children?: React.ReactNode;
};

export function CommentItem({
  comment,
  onReply,
  onShowReplies,
  showRepliesButton,
  nested,
  replyTo,
  onDelete,
  children,
}: CommentItemProps) {
  const username = comment.user?.username ?? "Unknown user";
  const initial = username.charAt(0).toUpperCase();
  const date = comment.createdAt
    ? new Date(comment.createdAt).toLocaleString()
    : "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  useEffect(() => {
    import("lightbox2/dist/js/lightbox.js");
  }, [comment.attachment]);

  return (
    <div className={nested ? styles.nestedCard : styles.card}>
      {nested && replyTo ? (
        <p className={styles.quote}>Reply to {replyTo}</p>
      ) : null}

      <header className={styles.header}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.meta}>
          <p className={styles.username}>{username}</p>
          <p className={styles.date}>{date}</p>
        </div>
      </header>

      <div
        className={styles.text}
        dangerouslySetInnerHTML={{ __html: comment.text }}
      />

      {comment.attachment && comment.attachment.length > 0 ? (
        <div className={styles.attachments}>
          {comment.attachment.map((file) => {
            const fileUrl = `${apiUrl}${file.path}`;

            if (file.type === "IMAGE") {
              return (
                <a
                  key={file.id}
                  href={fileUrl}
                  data-lightbox={`comment-${comment.id}`}
                  data-title={file.originalName}
                >
                  <img src={fileUrl} alt={file.originalName} />
                </a>
              );
            }

            if (file.type === "TEXT") {
              return (
                <a
                  key={file.id}
                  href={fileUrl}
                  download={file.originalName}
                  className={styles.fileLink}
                >
                  Download {file.originalName}
                </a>
              );
            }

            return null;
          })}
        </div>
      ) : null}

      <div className={styles.actions}>
        <Button
          type="button"
          className={styles.replyBtn}
          onClick={() => onReply(comment.id)}
        >
          Reply
        </Button>
        {showRepliesButton && onShowReplies ? (
          <Button
            type="button"
            className={styles.showRepliesBtn}
            onClick={onShowReplies}
          >
            Show replies
          </Button>
        ) : null}
        {onDelete ? (
          <Button
            type="button"
            className={styles.deleteBtn}
            onClick={() => onDelete(comment.id)}
          >
            Delete
          </Button>
        ) : null}
      </div>

      {children ? <div className={styles.threadBody}>{children}</div> : null}
    </div>
  );
}
