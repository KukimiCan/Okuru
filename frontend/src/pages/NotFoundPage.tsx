import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="placeholder">
      <p className="placeholder-label">404</p>
      <h1>ページが見つかりません</h1>
      <p>URLが正しくないか、ページが移動・削除された可能性があります。</p>
      <div className="action-row">
        <Link className="button-primary" to="/">
          トップへ戻る
        </Link>
        <Link className="button-secondary" to="/stories">
          体験談を見る
        </Link>
        <Link className="button-secondary" to="/consultations/new">
          AIに相談する
        </Link>
      </div>
    </section>
  );
}
