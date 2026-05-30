import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="home-page">
      <div>
        <p className="placeholder-label">Gift planning support</p>
        <h1>Okuru</h1>
        <p>
          AIの提案とリアルな体験談を組み合わせて、プレゼント選びを助けるWebアプリです。
        </p>
      </div>
      <div className="action-row">
        <Link className="button-primary" to="/consultations/new">
          AI相談を始める
        </Link>
        <Link className="button-secondary" to="/stories">
          体験談を見る
        </Link>
      </div>
    </section>
  );
}
