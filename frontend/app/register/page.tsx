"use client";

import { Button } from "@/components/button/Button";
import { Input } from "@/components/input/Input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCaptcha } from "@/lib/api";
import { Captcha } from "@/components/captcha/Capthca";
import Link from "next/link";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaSVG, setCaptchaSVG] = useState("");
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const router = useRouter();

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
    setSuccess(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          captcha: captcha.trim(),
          captchaSessionId,
          client_meta:
            typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
        headers: { "Content-Type": "application/json" },
      });
      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;

      if (res.ok) {
        setSuccess("Registration successful");
        router.push("/login");
        return;
      }

      setError(data?.message ?? "Registration failed");
      refreshCaptcha();
    } catch {
      setError("An error occurred while registering");
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

        <h1 className={styles.title}>Register</h1>
        <p className={styles.subtitle}>Create an account to comment faster</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        {success ? <p className={styles.success}>{success}</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        <p className={styles.footer}>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
