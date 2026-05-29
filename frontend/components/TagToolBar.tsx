import { Button } from "./button/Button";
import styles from "./TagToolBar.module.css";

type TagToolBarProps = {
  onInsert: (openTag: string, closeTag: string) => void;
};

export function TagToolBar({ onInsert }: TagToolBarProps) {
  return (
    <div className={styles.toolbar}>
      <Button type="button" onClick={() => onInsert("<i>", "</i>")}>
        i
      </Button>
      <Button type="button" onClick={() => onInsert("<strong>", "</strong>")}>
        strong
      </Button>
      <Button type="button" onClick={() => onInsert("<code>", "</code>")}>
        code
      </Button>
      <Button
        type="button"
        onClick={() => onInsert('<a href="https://">', "</a>")}
      >
        a
      </Button>
    </div>
  );
}
