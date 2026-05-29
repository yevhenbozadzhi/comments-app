import { CreateComment } from "@/types";
import { CommentForm } from "./CommentForm";
import styles from "./CommentForm.module.css";

type ReplyFormProps = {
  parentId: string;
  parentUsername?: string;
  onSubmit: (comment: CreateComment, file?: File) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

export function ReplyForm({
  parentId,
  parentUsername,
  onSubmit,
  onCancel,
  loading,
  error,
}: ReplyFormProps) {
  return (
    <div className={styles.replyBox}>
      <div className={styles.replyHeader}>
        <span>Reply to {parentUsername ?? "comment"}</span>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
      <CommentForm
        parentId={parentId}
        variant="reply"
        onSubmit={onSubmit}
        onPreview={() => {}}
        loading={loading}
        error={error}
      />
    </div>
  );
}
