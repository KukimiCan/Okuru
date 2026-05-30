import type { ConsultationResult } from "../types/consultation";
import type { Story } from "../types/story";

export const mockConsultationResult: ConsultationResult = {
  summary: "実用性と相手の生活に馴染むことを重視した提案です。",
  gift_candidates: [
    {
      name: "上質なコーヒー豆とドリッパーのセット",
      reason: "コーヒーが好きな相手に、日常で使える少し特別な体験を贈れます。",
      budget_range: "3,000-5,000円",
      caution: "すでに器具を持っている場合は豆やフィルター中心に調整すると安心です。",
      suitable_for: "忙しい中でも家で一息つく時間を大切にする人",
      message: "休憩時間に少しでもほっとできたら嬉しいです。",
    },
    {
      name: "軽量のタンブラー",
      reason: "通勤や外出時に使いやすく、相手の負担になりにくいギフトです。",
      budget_range: "2,500-4,500円",
      caution: "容量や洗いやすさを確認して選ぶと使われやすくなります。",
      suitable_for: "仕事や外出が多い人",
      message: "移動中にも好きな飲み物を楽しんでね。",
    },
  ],
  tips: ["生活動線の中で使えるものを選ぶ", "消耗品や軽いものは贈りやすい"],
  avoid: ["大きくて置き場所を取るもの", "好みが強く分かれる香りもの"],
};

export const mockStories: Story[] = [
  {
    id: "story_mock_1",
    title: "友人の誕生日にコーヒーセットを贈って喜ばれた話",
    relationship: "friend",
    purpose: "birthday",
    budget_range: "3000-5000",
    gift_item: "コーヒー関連グッズ",
    result: "success",
    body: "相手が在宅勤務の日にコーヒーをよく飲むと聞いていたので、豆とドリッパーを組み合わせて贈りました。使う場面が想像しやすかったようで、とても喜んでもらえました。",
    visibility: "public",
    keywords: ["coffee", "practical"],
    created_at: "2026-05-25T12:10:00Z",
  },
  {
    id: "story_mock_2",
    title: "同僚へのお礼に小さな焼き菓子を選んだ話",
    relationship: "coworker",
    purpose: "thanks",
    budget_range: "1000-3000",
    gift_item: "焼き菓子",
    result: "normal",
    body: "重すぎないお礼にしたくて焼き菓子を選びました。喜んではもらえましたが、甘いものの好みをもう少し聞いておくとよかったです。",
    visibility: "public",
    keywords: ["sweets", "thanks"],
    created_at: "2026-05-24T09:00:00Z",
  },
];
