import { RefreshCcw } from "lucide-react";
import { Button } from "../button/Button";
import { Input } from "../input/Input";

type CaptchaProps = {
  captchaSVG: string;
  value: string;
  onChange: (value: string) => void;
  onRefresh: () => void;
};

export function Captcha({
  captchaSVG,
  value,
  onChange,
  onRefresh,
}: CaptchaProps) {
  const captchaSrc = captchaSVG
    ? `data:image/svg+xml;utf8,${encodeURIComponent(captchaSVG)}`
    : null;

  return (
    <div>
      {captchaSrc ? <img src={captchaSrc} alt="Captcha" /> : null}
      <Input
        type="text"
        placeholder="Enter captcha"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      <Button type="button" onClick={onRefresh}>
        <RefreshCcw />
      </Button>
    </div>
  );
}
