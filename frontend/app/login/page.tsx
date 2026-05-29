"use client";

import { Button } from "@/components/button/Button";
import { Input } from "@/components/input/Input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";
import { Captcha } from "@/components/captcha/Capthca";
import { getCaptcha } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AuthUser } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaSVG, setCaptchaSVG] = useState("");
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const refreshCaptcha = async () => {
    const data = await getCaptcha();
    setCaptchaSVG(data.captcha);
    setCaptchaSessionId(data.sessionId);
    setCaptcha("");
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
          captcha: captcha.trim(),
          captchaSessionId,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;

      if (res.ok && data?.accessToken && data?.user) {
        login(data.accessToken, data.user as AuthUser);
        router.push("/");
        return;
      }

      setError(data?.message ?? "Login failed");
      refreshCaptcha();
    } catch {
      setError("An error occurred while logging in");
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topActions}>
          <Button
            type="button"
            className={styles.guestBtn}
            onClick={() => router.push("/")}
          >
            Continue as guest
          </Button>
        </div>

        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>Sign in to post comments as yourself</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className={styles.captchaRow}>
            <Captcha
              captchaSVG={captchaSVG}
              value={captcha}
              onChange={setCaptcha}
              onRefresh={refreshCaptcha}
            />
          </div>
          <Button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !captchaSessionId}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {error ? <p className={styles.error}>{error}</p> : null}

        <p className={styles.footer}>
          No account? <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
