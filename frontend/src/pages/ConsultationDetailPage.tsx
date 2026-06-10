import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { mockConsultationResult } from "../lib/mockData";
import { getConsultation } from "../services/consultationService";
import type {
  ConsultationCreateResponse,
  ConsultationDetail,
  ConsultationResult,
} from "../types/consultation";

export function ConsultationDetailPage() {
  const { consultationId } = useParams();
  const location = useLocation();
  const stateConsultation = (location.state as { consultation?: ConsultationCreateResponse })
    ?.consultation;
  const [result, setResult] = useState<ConsultationResult | null>(
    stateConsultation?.result ?? null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!consultationId || stateConsultation) {
      return;
    }

    getConsultation(consultationId)
      .then((data: ConsultationDetail) => setResult(data.result))
      .catch(() => {
        setResult(mockConsultationResult);
        setErrorMessage("APIから取得できないため、表示例を表示しています。");
      });
  }, [consultationId, stateConsultation]);

  const displayResult = result ?? mockConsultationResult;

  return (
    <section className="detail-page">
      <div>
        <p className="placeholder-label">Consultation Result</p>
        <h1>AI相談結果</h1>
        <p>{displayResult.summary}</p>
      </div>

      {errorMessage ? (
        <div className="notice" role="status">
          {errorMessage}
        </div>
      ) : null}

      <div className="card-grid">
        {displayResult.gift_candidates.map((candidate) => (
          <article className="result-card" key={candidate.name}>
            <div>
              <p className="placeholder-label">{candidate.budget_range}</p>
              <h2>{candidate.name}</h2>
            </div>
            <dl className="info-list">
              <div>
                <dt>理由</dt>
                <dd>{candidate.reason}</dd>
              </div>
              <div>
                <dt>注意点</dt>
                <dd>{candidate.caution}</dd>
              </div>
              <div>
                <dt>向いている相手</dt>
                <dd>{candidate.suitable_for}</dd>
              </div>
              <div>
                <dt>渡すときの一言</dt>
                <dd>{candidate.message}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="section-grid">
        <article className="info-panel">
          <h2>選び方のコツ</h2>
          <ul>
            {displayResult.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>
        <article className="info-panel">
          <h2>避けた方がよいこと</h2>
          <ul>
            {displayResult.avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="action-row">
        <Link className="button-primary" to="/consultations/new">
          もう一度相談する
        </Link>
        <Link className="button-secondary" to="/stories">
          体験談を見る
        </Link>
      </div>
    </section>
  );
}
