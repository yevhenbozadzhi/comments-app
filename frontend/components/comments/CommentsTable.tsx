import { Comment } from "@/types";
import styles from "./CommentsTable.module.css";

type CommentsTableProps = {
  comments: Comment[];
  sortBy: string;
  sortOrder: string;
  onSort: (field: string) => void;
};

function sortMark(active: boolean, sortOrder: string) {
  if (!active) {
    return "";
  }
  return sortOrder === "asc" ? " ↑" : " ↓";
}

export function CommentsTable({
  comments,
  sortBy,
  sortOrder,
  onSort,
}: CommentsTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <button type="button" onClick={() => onSort("username")}>
                User{sortMark(sortBy === "username", sortOrder)}
              </button>
            </th>
            <th>
              <button type="button" onClick={() => onSort("email")}>
                Email{sortMark(sortBy === "email", sortOrder)}
              </button>
            </th>
            <th>
              <button type="button" onClick={() => onSort("createdAt")}>
                Date{sortMark(sortBy === "createdAt", sortOrder)}
              </button>
            </th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.id}>
              <td>{comment.user?.username ?? "—"}</td>
              <td>{comment.user?.email ?? "—"}</td>
              <td>
                {comment.createdAt
                  ? new Date(comment.createdAt).toLocaleString()
                  : "—"}
              </td>
              <td className={styles.textCell}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: comment.text.slice(0, 120),
                  }}
                />
                {comment.text.length > 120 ? "…" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
