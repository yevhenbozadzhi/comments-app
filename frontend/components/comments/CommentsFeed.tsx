"use client";

import { Comment, CreateComment } from "@/types";
import { CommentItem } from "./CommentItem";
import styles from "./CommentsFeed.module.css";
import { ReplyForm } from "./ReplyForm";
import commentItemStyles from "./CommentItem.module.css";

type CommentsFeedProps = {
  comments: Comment[];
  replyId: string | null;
  repliesByParent: Record<string, Comment[]>;
  onLoadReplies: (parentId: string) => void;
  onReply: (commentId: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (
    parentId: string,
    comment: CreateComment,
    file?: File,
  ) => Promise<boolean>;
  onDelete?: (commentId: string) => void;
  isLoading?: boolean;
  error?: string | null;
};

export function CommentsFeed({
  comments,
  replyId,
  repliesByParent,
  onLoadReplies,
  onReply,
  onCancelReply,
  onSubmitReply,
  onDelete,
  isLoading,
  error,
}: CommentsFeedProps) {
  if (comments.length === 0) {
    return (
      <p className={styles.empty}>No comments yet. Be the first to post.</p>
    );
  }

  return (
    <div className={styles.feed}>
      {comments.map((comment) => {
        const replies = repliesByParent[comment.id];
        const repliesLoaded = comment.id in repliesByParent;
        const isReplyOpen = replyId === comment.id;

        return (
          <div key={comment.id} className={styles.thread}>
            <CommentItem
              comment={comment}
              onReply={onReply}
              onDelete={onDelete}
              showRepliesButton={!repliesLoaded}
              onShowReplies={() => onLoadReplies(comment.id)}
            >
              {replies && replies.length > 0 ? (
                <div className={commentItemStyles.repliesList}>
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      nested
                      replyTo={comment.user?.username}
                      onReply={() => onReply(comment.id)}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : repliesLoaded && replies?.length === 0 ? (
                <p className={commentItemStyles.noReplies}>No replies yet</p>
              ) : null}

              {isReplyOpen ? (
                <ReplyForm
                  parentId={comment.id}
                  parentUsername={comment.user?.username}
                  onSubmit={(data, file) =>
                    onSubmitReply(comment.id, data, file)
                  }
                  onCancel={onCancelReply}
                  loading={isLoading}
                  error={error}
                />
              ) : null}
            </CommentItem>
          </div>
        );
      })}
    </div>
  );
}
