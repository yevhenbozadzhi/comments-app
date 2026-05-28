import { CommentItem } from "./CommentItem";
import { Comment } from "@/types";
type CommentsTableProps = {
  comments: Comment[];
  sortBy: string;
  sortOrder: string;
  onSort: (field: string) => void;
  onReply: (commentId: string) => void;
};

export function CommentsTable({
  comments,
  sortBy,
  sortOrder,
  onSort,
  onReply,
}: CommentsTableProps) {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th onClick={() => onSort("username")}>User</th>
            <th onClick={() => onSort("email")}>Email</th>
            <th onClick={() => onSort("createdAt")}>Date</th>
            <th>Text</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment, index) => (
            <CommentItem
              key={comment.id ?? `comment-${index}`}
              comment={comment}
              onReply={onReply}
              variant="table"
            />
          ))}
        </tbody>
      </table>
    </>
  );
}
