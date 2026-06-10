import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { signInWithEmail } from "../services/authService";
import { isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../features/auth/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state
      ? `${location.state.from}`
      : "/mypage";

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
          <p className="placeholder-label">Account</p>
          <h1>ログイン済みです</h1>
          <p>このアカウントで認証が必要なページを利用できます。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="form-page">
      <div>
        <p className="placeholder-label">Account</p>
        <h1>ログイン</h1>
        <p>メールアドレスとパスワードでログインします。</p>
      </div>

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
