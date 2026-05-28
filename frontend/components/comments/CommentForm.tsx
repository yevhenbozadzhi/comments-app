import { CreateComment, PreviewComment } from "@/types";
import { useEffect, useRef, useState } from "react";
import { Button } from "../button/Button";
import { Captcha } from "../captcha/Capthca";
import { FileUpload } from "../FileUpload";
import { getCaptcha } from "@/lib/api";

type CommentFormProps = {
  onSubmit: (comment: CreateComment, file?: File) => Promise<boolean>;
  onPreview: (comment: PreviewComment) => void;
  parentId?: string;
  loading?: boolean;
  error?: string | null;
};

export function CommentForm({
  onSubmit,
  onPreview,
  parentId,
  loading,
  error,
}: CommentFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [homepage, setHomepage] = useState("");
  const [text, setText] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [client_meta, setClient_meta] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [captchaSVG, setCaptchaSVG] = useState("");
  const captchaRequestId = useRef(0);

  const refreshCaptcha = async () => {
    const requestId = ++captchaRequestId.current;
    setCaptcha("");

    try {
      const { sessionId, captcha: svg } = await getCaptcha();
      if (requestId !== captchaRequestId.current) {
        return;
      }
      setCaptchaSessionId(sessionId);
      setCaptchaSVG(svg);
    } catch {
      if (requestId === captchaRequestId.current) {
        setCaptchaSessionId("");
        setCaptchaSVG("");
      }
    }
  };

  useEffect(() => {
    setClient_meta(navigator.userAgent);
    void refreshCaptcha();
  }, []);

  useEffect(() => {
    if (error?.toLowerCase().includes("капч") || error?.toLowerCase().includes("captcha")) {
      void refreshCaptcha();
    }
  }, [error]);

  const fileSelected = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await onSubmit(
      {
        username: username.trim(),
        email: email.trim(),
        homepage: homepage.trim(),
        text: text.trim(),
        captcha: captcha.trim(),
        captchaSessionId: captchaSessionId,
        client_meta: client_meta,
        parentId: parentId ?? undefined,
      },
      file ?? undefined,
    );

    if (!success) {
      return;
    }

    setText("");
    setCaptcha("");
    setFile(null);
    await refreshCaptcha();
  };

  const handlePreview = () => {
    onPreview({
      username: username,
      email: email,
      homepage: homepage,
      text: text,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username (letters and numbers only)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          pattern="[A-Za-z0-9]+"
          required
        />
        <input
          type="email"
          placeholder="Email (user@mail.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="url"
          placeholder="Homepage (https://...) — optional"
          value={homepage}
          onChange={(e) => setHomepage(e.target.value)}
        />
        <textarea
          placeholder="Text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <Captcha
          captchaSVG={captchaSVG}
          value={captcha}
          onChange={setCaptcha}
          onRefresh={refreshCaptcha}
        />
        <Button type="submit" disabled={loading || !captchaSessionId}>
          Submit
        </Button>
        <Button type="button" onClick={handlePreview}>
          Preview
        </Button>
      </form>
      <FileUpload file={file} onFileSelected={fileSelected} />
    </>
  );
}
