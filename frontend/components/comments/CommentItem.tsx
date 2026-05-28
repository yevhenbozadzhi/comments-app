import { Comment } from "../../types";
import { Button } from "../button/Button";

type CommentItemProps = {
  comment: Comment;
  onReply: (commentId: string) => void;
  variant?: "table" | "card";
};

export function CommentItem({
  comment,
  onReply,
  variant = "card",
}: CommentItemProps) {
  const username = comment.user?.username ?? "Unknown user";
  const email = comment.user?.email ?? "";
  const date = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString()
    : "";

  if (variant === "table") {
    return (
      <tr>
        <td>{username}</td>
        <td>{email}</td>
        <td>{date}</td>
        <td>{comment.text}</td>
        <td>
          <Button onClick={() => onReply(comment.id)}>Reply</Button>
        </td>
      </tr>
    );
  }

  return (
    <div>
      <h3>{username}</h3>
      <p>{comment.text}</p>
      <p>{date}</p>
      <p>{comment.attachment?.length ?? 0}</p>
      <Button onClick={() => onReply(comment.id)}>Reply</Button>
    </div>
  );
}
