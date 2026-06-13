import { useState } from "react";
import { Link } from "react-router-dom";

import { Modal } from "../components/feedback/Modal";

type BentoItem = {
  title: string;
  teaser: string;
  detail: string;
};

const features: BentoItem[] = [
  {
    title: "条件から候補を絞る",
    teaser: "年齢層・関係性・予算・趣味から候補を整理。",
    detail:
      "年齢層、関係性、目的、予算、趣味、避けたいものを入力して相談できます。条件を詳しく伝えるほど、AIの提案も的確になります。",
  },
  {
    title: "理由まで比較する",
    teaser: "候補ごとの理由・注意点・一言メッセージ付き。",
    detail:
      "候補ごとの理由、予算感、注意点、渡すときの一言をまとめて確認できます。気になる候補はクリックでポップアップ表示。",
  },
  {
    title: "実体験から学ぶ",
    teaser: "成功談も失敗談もまとめて参考に。",
    detail:
      "成功談だけでなく、普通だった話や失敗談も含めて判断材料にできます。似た条件の体験談を検索して読み比べましょう。",
  },
];

const steps: BentoItem[] = [
  {
    title: "条件を入力する",
    teaser: "フォームに相手の情報を入力。",
    detail: "相手の年齢層、関係性、目的、予算、趣味や避けたいものをフォームで入力します。",
  },
  {
    title: "AIの提案を見る",
    teaser: "候補・理由・注意点を一覧で確認。",
    detail:
      "候補ごとの理由、予算感、注意点、渡すときの一言メッセージまでまとめて確認できます。",
  },
  {
    title: "体験談を参考にする",
    teaser: "似た条件の体験談で答え合わせ。",
    detail: "似た条件で贈った人の体験談を読み、成功談も失敗談も選択の参考にできます。",
  },
];

export function HomePage() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div>
          <p className="placeholder-label">AIギフトアドバイザー</p>
          <h1>贈り物選びに、もう迷わない。</h1>
          <p>
            相手の特徴や関係性、予算を伝えるだけでAIがギフト候補を整理。実際に贈った人の体験談も合わせて確認できます。
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

      <div className="bento-grid">
        {features.map((feature, index) => (
          <button
            className="bento-tile bento-tile-feature"
            key={feature.title}
            onClick={() => setActiveFeature(index)}
            type="button"
          >
            <h2>{feature.title}</h2>
            <p>{feature.teaser}</p>
          </button>
        ))}
        {steps.map((step, index) => (
          <button
            className="bento-tile bento-tile-step"
            key={step.title}
            onClick={() => setActiveStep(index)}
            type="button"
          >
            <span className="step-number">{index + 1}</span>
            <h2>{step.title}</h2>
            <p>{step.teaser}</p>
          </button>
        ))}
      </div>

      {activeFeature !== null ? (
        <Modal onClose={() => setActiveFeature(null)} title={features[activeFeature].title}>
          <p>{features[activeFeature].detail}</p>
        </Modal>
      ) : null}

      {activeStep !== null ? (
        <Modal
          onClose={() => setActiveStep(null)}
          title={`STEP ${activeStep + 1}: ${steps[activeStep].title}`}
        >
          <p>{steps[activeStep].detail}</p>
        </Modal>
      ) : null}
    </div>
  );
}
