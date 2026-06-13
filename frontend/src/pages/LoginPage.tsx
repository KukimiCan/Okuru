import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { signInWithEmail } from "../services/authService";
import { isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../features/auth/AuthContext";

type LoginState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as LoginState | null;
  const redirectTo = state?.from?.pathname || "/mypage";
  const requiresLogin = Boolean(state?.from);

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, redirectTo, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signInWithEmail(email, password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ログインに失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (user) {
    return (
      <section className="form-page">
        <div>
          <h1>マイページへ移動します</h1>
          <p>ログイン済みのため、自動的に移動します。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="form-page">
      <div>
        <h1>ログイン</h1>
        <p>メールアドレスとパスワードでログインします。</p>
      </div>

      {requiresLogin ? (
        <div className="notice" role="status">
          この機能を利用するにはログインが必要です。
        </div>
      ) : null}

      {!isSupabaseConfigured ? (
        <div className="notice" role="alert">
          Supabase の環境変数が未設定です。`frontend/.env` に
          `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定してください。
        </div>
      ) : null}

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>メールアドレス</span>
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="field">
          <span>パスワード</span>
          <input
            autoComplete="current-password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {errorMessage ? (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button className="button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </section>
  );
}
