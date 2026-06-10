import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div>
          <p className="placeholder-label">Gift planning support</p>
          <h1>Okuru</h1>
          <p>
            贈る相手の特徴、関係性、予算をもとにAIがギフト候補を整理し、
            実際に贈った人の体験談も一緒に参考にできるプレゼント選び支援アプリです。
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

      <section className="section-grid" aria-label="Okuruでできること">
        <article className="info-panel">
          <h2>条件から候補を絞る</h2>
          <p>年齢層、関係性、目的、予算、趣味、避けたいものを入力して相談できます。</p>
        </article>
        <article className="info-panel">
          <h2>理由まで比較する</h2>
          <p>候補ごとの理由、予算感、注意点、渡すときの一言をまとめて確認できます。</p>
        </article>
        <article className="info-panel">
          <h2>実体験から学ぶ</h2>
          <p>成功談だけでなく、普通だった話や失敗談も含めて判断材料にできます。</p>
        </article>
      </section>
    </div>
  );
}
