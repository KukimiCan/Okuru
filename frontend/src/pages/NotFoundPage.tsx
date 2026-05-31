import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="placeholder">
      <p className="placeholder-label">404</p>
      <h1>ページが見つかりません</h1>
      <p>URLを確認するか、トップページから移動してください。</p>
      <Link className="button-secondary" to="/">
        トップへ戻る
      </Link>
    </section>
  );
}
