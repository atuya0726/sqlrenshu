export type AffiliateOffer = {
  id: string;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  status: 'placeholder' | 'active' | 'retired';
};

// Amazonの商品・URLはここだけで管理する。ASIN確定後に placeholder を差し替える。
export const affiliateOffers: Record<string, AffiliateOffer> = {
  'sql-book-01': {
    id: 'sql-book-01',
    title: 'SQL入門書（準備中）',
    description: '手元に置いて参照しやすい入門書を掲載予定です。',
    status: 'placeholder',
  },
};
