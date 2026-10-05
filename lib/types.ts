export type MarketStatus = "Real-time" | "Delayed" | "End-of-day" | "Data unavailable";

export type Quote = {
  symbol: string;
  name: string;
  exchange: string;
  price: number | null;
  previousClose: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  change: number | null;
  percentChange: number | null;
  volume: number | null;
  currency: string;
  status: MarketStatus;
  updatedAt: string | null;
  source: string;
};

export type MarketIndex = {
  name: string;
  symbol: string;
  value: number | null;
  change: number | null;
  percentChange: number | null;
  status: MarketStatus;
  updatedAt: string | null;
  source: string;
};

export type NewsItem = {
  id: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string | null;
  symbol?: string;
  summary?: string;
  imageUrl?: string;
};

export type SearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  price: number | null;
  percentChange: number | null;
  status: MarketStatus;
};

export type HistoricalPoint = {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
};

export type CompanyResearch = {
  symbol: string;
  name: string;
  exchange: string;
  industry: string | null;
  description: string | null;
  bseCode: string | null;
  nseCode: string | null;
  marketCap: number | null;
  dividendYield: number | null;
  debtToEquity: number | null;
  netIncome: number | null;
  averageRating: string | null;
  sectorPe: number | null;
  peerCompanies: Array<{
    symbol: string;
    name: string;
    price: number | null;
    percentChange: number | null;
    marketCap: number | null;
    priceToEarningsValueRatio: number | null;
    priceToBookValueRatio: number | null;
  }>;
  source: string;
};

export type MarketMover = {
  symbol: string;
  name: string;
  exchange: string;
  price: number | null;
  change: number | null;
  percentChange: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
};
