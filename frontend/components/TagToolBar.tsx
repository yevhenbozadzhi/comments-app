import { Bold, Italic, Strikethrough, Underline } from "lucide-react";
import { Button } from "./button/Button";

export function TagToolBar() {
  return (
    <div>
      <Button>
        <Bold />
      </Button>
      <Button>
        <Italic />
      </Button>
      <Button>
        <Underline />
      </Button>
      <Button>
        <Strikethrough />
      </Button>
    </div>
  );
}
