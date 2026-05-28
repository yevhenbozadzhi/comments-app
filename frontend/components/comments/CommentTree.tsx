import { CommentItem } from "./CommentItem";
import { Comment } from "@/types";
type CommentTreeProps = {
  items: Comment[];
  onReply: (commentId: string) => void;
};

export function CommentTree({ items, onReply }: CommentTreeProps) {
  return (
    <>
      {items.map((item) => (
        <div key={item.id}>
          <CommentItem comment={item} onReply={onReply} />
          {item.replies && item.replies.length > 0 ? (
            <CommentTree items={item.replies} onReply={onReply} />
          ) : null}
        </div>
      ))}
    </>
  );
}
