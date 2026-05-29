import { CreateComment, PreviewComment } from "@/types";
import { useEffect, useRef, useState } from "react";
import { Button } from "../button/Button";
import { Captcha } from "../captcha/Capthca";
import { FileUpload } from "../FileUpload";
import { getCaptcha } from "@/lib/api";
import styles from "./CommentForm.module.css";
import { useAuth } from "@/hooks/useAuth";
import { TagToolBar } from "../TagToolBar";
import { validateCommentForm, CommentFormErrors } from "@/utils/validation";

type CommentFormProps = {
  onSubmit: (comment: CreateComment, file?: File) => Promise<boolean>;
  onPreview: (comment: PreviewComment) => void;
  parentId?: string;
  loading?: boolean;
  error?: string | null;
  variant: "comment" | "reply";
};

export function CommentForm({
  onSubmit,
  onPreview,
  parentId,
  loading,
  error,
  variant,
}: CommentFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [homepage, setHomepage] = useState("");
  const [text, setText] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [client_meta] = useState(() =>
    typeof navigator !== "undefined" ? navigator.userAgent : "",
  );

  const [file, setFile] = useState<File | null>(null);
  const [captchaSVG, setCaptchaSVG] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CommentFormErrors>({});
  const captchaRequestId = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { ok, isAuthenticated, user } = useAuth();
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
    refreshCaptcha();
  }, []);

  const insertTag = (openTag: string, closeTag: string) => {
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => prev + openTag + closeTag);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = text.slice(start, end);
    const next =
      text.slice(0, start) + openTag + selected + closeTag + text.slice(end);
    setText(next);
  };

  const fileSelected = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateCommentForm({
      username,
      email,
      homepage,
      text,
      captcha,
      isAuthenticated: Boolean(isAuthenticated),
    });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const payload: CreateComment = {
      username: isAuthenticated ? user!.username : username.trim(),
      email: isAuthenticated ? user!.email : email.trim(),
      homepage: isAuthenticated ? (user?.homepage ?? "") : homepage.trim(),
      text: text.trim(),
      captcha: captcha.trim(),
      captchaSessionId,
      client_meta,
      parentId: parentId ?? undefined,
    };

    const success = await onSubmit(payload, file ?? undefined);
    if (!success) {
      return;
    }
    setText("");
    setCaptcha("");
    setFile(null);
    if (!isAuthenticated) {
      setUsername("");
      setEmail("");
      setHomepage("");
    }
    await refreshCaptcha();
  };

  const handlePreview = () => {
    const errors = validateCommentForm({
      username,
      email,
      homepage,
      text,
      captcha,
      isAuthenticated: Boolean(isAuthenticated),
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    onPreview({
      username: isAuthenticated ? (user?.username ?? "") : username,
      email: isAuthenticated ? (user?.email ?? "") : email,
      homepage: isAuthenticated ? (user?.homepage ?? "") : homepage,
      text: text,
    });
  };

  const showGuestFields = ok && !isAuthenticated;

  return (
    <form
      onSubmit={handleSubmit}
      className={variant === "reply" ? styles.replyForm : styles.commentForm}
    >
      {isAuthenticated && user ? (
        <p className={styles.authHint}>Posting as {user.username}</p>
      ) : null}

      {variant === "reply" ? (
        <>
          {showGuestFields ? (
            <div className={styles.userRow}>
              <input
                type="text"
                placeholder="Username (letters and numbers only)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              {fieldErrors.username ? (
                <p className={styles.fieldError}>{fieldErrors.username}</p>
              ) : null}

              <input
                type="email"
                placeholder="Email (user@mail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {fieldErrors.email ? (
                <p className={styles.fieldError}>{fieldErrors.email}</p>
              ) : null}
            </div>
          ) : null}

          <TagToolBar onInsert={insertTag} />

          <textarea
            ref={textareaRef}
            className={styles.replyText}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {fieldErrors.text ? (
            <p className={styles.fieldError}>{fieldErrors.text}</p>
          ) : null}

          <Captcha
            captchaSVG={captchaSVG}
            value={captcha}
            onChange={setCaptcha}
            onRefresh={refreshCaptcha}
          />

          {fieldErrors.captcha ? (
            <p className={styles.fieldError}>{fieldErrors.captcha}</p>
          ) : null}

          <button type="submit" disabled={loading || !captchaSessionId}>
            Reply
          </button>
        </>
      ) : (
        <>
          {showGuestFields ? (
            <>
              <input
                type="text"
                placeholder="Username (letters and numbers only)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              {fieldErrors.username ? (
                <p className={styles.fieldError}>{fieldErrors.username}</p>
              ) : null}

              <input
                type="email"
                placeholder="Email (user@mail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {fieldErrors.email ? (
                <p className={styles.fieldError}>{fieldErrors.email}</p>
              ) : null}

              <input
                type="url"
                placeholder="Homepage (https://...) — optional"
                value={homepage}
                onChange={(e) => setHomepage(e.target.value)}
              />

              {fieldErrors.homepage ? (
                <p className={styles.fieldError}>{fieldErrors.homepage}</p>
              ) : null}
            </>
          ) : null}

          <TagToolBar onInsert={insertTag} />

          <textarea
            ref={textareaRef}
            placeholder="Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {fieldErrors.text ? (
            <p className={styles.fieldError}>{fieldErrors.text}</p>
          ) : null}

          <FileUpload file={file} onFileSelected={fileSelected} />

          <Captcha
            captchaSVG={captchaSVG}
            value={captcha}
            onChange={setCaptcha}
            onRefresh={refreshCaptcha}
          />

          {fieldErrors.captcha ? (
            <p className={styles.fieldError}>{fieldErrors.captcha}</p>
          ) : null}

          <Button type="submit" disabled={loading || !captchaSessionId}>
            Submit
          </Button>

          <Button type="button" onClick={handlePreview}>
            Preview
          </Button>
        </>
      )}
    </form>
  );
}
