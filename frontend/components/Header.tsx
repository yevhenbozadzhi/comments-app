"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "./button/Button";
import { CommentForm } from "./comments/CommentForm";
import { CreateComment, PreviewComment } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Header.module.css";

type HeaderProps = {
  isFormOpen: boolean;
  onToggleForm: () => void;
  onSubmit: (comment: CreateComment, file?: File) => Promise<boolean>;
  onPreview: (comment: PreviewComment) => void;
  loading?: boolean;
  error?: string | null;
};

export function Header({
  isFormOpen,
  onToggleForm,
  onSubmit,
  onPreview,
  loading,
  error,
}: HeaderProps) {
  const { ok, isAuthenticated, user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Button
          type="button"
          className={styles.newPostBtn}
          onClick={onToggleForm}
        >
          <Plus size={18} />
          {isFormOpen ? "Cancel" : "New Post"}
        </Button>

        {ok ? (
          <nav className={styles.authNav}>
            {isAuthenticated ? (
              <>
                <span className={styles.userLabel}>
                  {user?.username ?? user?.email}
                </span>
                <Button type="button" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
              </>
            )}
          </nav>
        ) : null}
      </div>

      {isFormOpen ? (
        <div className={styles.formCard}>
          <CommentForm
            variant="comment"
            onSubmit={onSubmit}
            onPreview={onPreview}
            loading={loading}
            error={error}
          />
        </div>
      ) : null}
    </header>
  );
}
