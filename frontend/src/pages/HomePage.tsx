import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import { Modal } from "../components/feedback/Modal";
import { TiltCard } from "../components/motion/TiltCard";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
        <motion.div
          animate={{ opacity: 0.5, scale: 1, x: [0, 18, 0], y: [0, -14, 0] }}
          aria-hidden="true"
          className="home-hero-glow"
          initial={{ opacity: 0, scale: 0.8 }}
          transition={{
            opacity: { duration: 0.6 },
            scale: { duration: 0.6 },
            x: { duration: 9, ease: "easeInOut", repeat: Infinity },
            y: { duration: 7, ease: "easeInOut", repeat: Infinity },
          }}
        />
        <motion.div
          animate={{ opacity: 0.35, rotate: [0, 12, 0], scale: 1, x: [0, -14, 0], y: [0, 16, 0] }}
          aria-hidden="true"
          className="home-hero-orb"
          initial={{ opacity: 0, scale: 0.6 }}
          transition={{
            opacity: { delay: 0.2, duration: 0.6 },
            rotate: { duration: 12, ease: "easeInOut", repeat: Infinity },
            scale: { delay: 0.2, duration: 0.6 },
            x: { duration: 8, ease: "easeInOut", repeat: Infinity },
            y: { duration: 10, ease: "easeInOut", repeat: Infinity },
          }}
        />
        <div>
          <motion.p
            animate="visible"
            className="placeholder-label"
            initial="hidden"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            variants={fadeUp}
          >
            AIギフトアドバイザー
          </motion.p>
          <motion.h1
            animate="visible"
            initial="hidden"
            transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            variants={fadeUp}
          >
            贈り物選びに、<span className="text-highlight">もう迷わない</span>。
          </motion.h1>
          <motion.p
            animate="visible"
            initial="hidden"
            transition={{ delay: 0.16, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            variants={fadeUp}
          >
            相手の特徴や関係性、予算を伝えるだけでAIがギフト候補を整理。実際に贈った人の体験談も合わせて確認できます。
          </motion.p>
        </div>
        <motion.div
          animate="visible"
          className="action-row"
          initial="hidden"
          transition={{ delay: 0.24, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
        >
          <Link className="button-primary" to="/consultations/new">
            AI相談を始める
          </Link>
          <Link className="button-secondary" to="/stories">
            体験談を見る
          </Link>
        </motion.div>
      </section>

      <div className="bento-grid">
        {features.map((feature, index) => (
          <TiltCard
            className="bento-tile bento-tile-feature"
            delay={index * 0.06}
            key={feature.title}
            onClick={() => setActiveFeature(index)}
          >
            <h2>{feature.title}</h2>
            <p>{feature.teaser}</p>
          </TiltCard>
        ))}
        {steps.map((step, index) => (
          <TiltCard
            className="bento-tile bento-tile-step"
            delay={(features.length + index) * 0.06}
            key={step.title}
            onClick={() => setActiveStep(index)}
          >
            <span className="step-number">{index + 1}</span>
            <h2>{step.title}</h2>
            <p>{step.teaser}</p>
          </TiltCard>
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
