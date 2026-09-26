import { getCachedValue, setCachedValue, withRequestDeduplication } from "@/lib/cache";
import type { MarketIndex, NewsItem, Quote, SearchResult } from "@/lib/types";

const MARKET_API_BASE_URL = process.env.MARKET_API_BASE_URL?.trim() ?? "";
const MARKET_API_KEY = process.env.MARKET_API_KEY?.trim() ?? "";
const NEWS_API_KEY = process.env.NEWS_API_KEY?.trim() ?? "";

function hasProviderConfig() {
  return Boolean(MARKET_API_BASE_URL && !MARKET_API_BASE_URL.includes("api.example.com"));
}

function buildHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (MARKET_API_KEY) {
    headers.Authorization = `Bearer ${MARKET_API_KEY}`;
  }

  return headers;
}

function normalizeStatus(value?: string | null): Quote["status"] | "Data unavailable" {
  if (!value) return "Data unavailable";
  const status = value.toLowerCase();
  if (status.includes("real")) return "Real-time";
  if (status.includes("delay")) return "Delayed";
  if (status.includes("eod") || status.includes("end-of-day")) return "End-of-day";
  return "Data unavailable";
}

async function requestJson<T>(url: string): Promise<T | null> {
  if (!hasProviderConfig()) {
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: buildHeaders(),
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.warn(`[market-api] Provider request failed with status ${response.status}.`);
      return null;
    }

    return await response.json() as T;
  } catch (error) {
    console.warn("[market-api] Provider request failed.", error);
    return null;
  }
}

export async function getMarketIndices(): Promise<MarketIndex[]> {
  const cacheKey = "market:indices";
  const cached = getCachedValue<MarketIndex[]>(cacheKey);
  if (cached) return cached;

  const data = await withRequestDeduplication(cacheKey, async () => {
    const payload = await requestJson<{ data?: Array<{ name?: string; symbol?: string; value?: number; change?: number; percent_change?: number; status?: string; updated_at?: string; source?: string }> }>(`${MARKET_API_BASE_URL}/market/indices?api_key=${MARKET_API_KEY}`);

    const normalized = (payload?.data ?? []).map((item) => ({
      name: item.name ?? "Index",
      symbol: item.symbol ?? "INDEX",
      value: typeof item.value === "number" ? item.value : null,
      change: typeof item.change === "number" ? item.change : null,
      percentChange: typeof item.percent_change === "number" ? item.percent_change : null,
      status: normalizeStatus(item.status),
      updatedAt: item.updated_at ?? null,
      source: item.source ?? "Market API",
    }));

    setCachedValue(cacheKey, normalized, 300000);
    return normalized;
  });

  return data;
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const normalized = query.trim();
  if (!normalized) return [];

  const cacheKey = `market:search:${normalized.toLowerCase()}`;
  const cached = getCachedValue<SearchResult[]>(cacheKey);
  if (cached) return cached;

  const data = await withRequestDeduplication(cacheKey, async () => {
    const payload = await requestJson<{ data?: Array<{ symbol?: string; name?: string; exchange?: string; sector?: string; price?: number; percent_change?: number; status?: string }> }>(`${MARKET_API_BASE_URL}/stocks/search?q=${encodeURIComponent(normalized)}&api_key=${MARKET_API_KEY}`);

    const normalizedResults = (payload?.data ?? []).slice(0, 8).map((item) => ({
      symbol: item.symbol ?? "",
      name: item.name ?? "Unknown",
      exchange: item.exchange ?? "NSE",
      sector: item.sector,
      price: typeof item.price === "number" ? item.price : null,
      percentChange: typeof item.percent_change === "number" ? item.percent_change : null,
      status: normalizeStatus(item.status),
    })).filter((item) => item.symbol);

    setCachedValue(cacheKey, normalizedResults, 300000);
    return normalizedResults;
  });

  return data;
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const value = symbol.trim().toUpperCase();
  if (!value) return null;

  const cacheKey = `market:quote:${value}`;
  const cached = getCachedValue<Quote>(cacheKey);
  if (cached) return cached;

  const data = await withRequestDeduplication(cacheKey, async () => {
    const payload = await requestJson<{ data?: { symbol?: string; name?: string; exchange?: string; price?: number; previous_close?: number; open?: number; high?: number; low?: number; change?: number; percent_change?: number; volume?: number; status?: string; updated_at?: string; source?: string } }>(`${MARKET_API_BASE_URL}/stocks/quote/${encodeURIComponent(value)}?api_key=${MARKET_API_KEY}`);
    const item = payload?.data;
    if (!item) return null;

    const normalized: Quote = {
      symbol: item.symbol ?? value,
      name: item.name ?? value,
      exchange: item.exchange ?? "NSE",
      price: typeof item.price === "number" ? item.price : null,
      previousClose: typeof item.previous_close === "number" ? item.previous_close : null,
      open: typeof item.open === "number" ? item.open : null,
      high: typeof item.high === "number" ? item.high : null,
      low: typeof item.low === "number" ? item.low : null,
      change: typeof item.change === "number" ? item.change : null,
      percentChange: typeof item.percent_change === "number" ? item.percent_change : null,
      volume: typeof item.volume === "number" ? item.volume : null,
      currency: "INR",
      status: normalizeStatus(item.status),
      updatedAt: item.updated_at ?? null,
      source: item.source ?? "Market API",
    };

    setCachedValue(cacheKey, normalized, 300000);
    return normalized;
  });

  return data;
}

export async function getNews(symbol?: string): Promise<NewsItem[]> {
  const cacheKey = `news:${symbol ?? "all"}`;
  const cached = getCachedValue<NewsItem[]>(cacheKey);
  if (cached) return cached;

  const data = await withRequestDeduplication(cacheKey, async () => {
    const url = symbol
      ? `${MARKET_API_BASE_URL}/news?symbol=${encodeURIComponent(symbol)}&api_key=${NEWS_API_KEY}`
      : `${MARKET_API_BASE_URL}/news?api_key=${NEWS_API_KEY}`;
    const payload = await requestJson<{ data?: Array<{ id?: string; headline?: string; source?: string; url?: string; published_at?: string; summary?: string; symbol?: string }> }>(url);

    const normalized: NewsItem[] = (payload?.data ?? []).slice(0, 12).map((item) => ({
      id: item.id ?? `${item.symbol ?? "news"}-${item.headline ?? "story"}`,
      headline: item.headline ?? "Market update",
      source: item.source ?? "News provider",
      url: item.url ?? "",
      publishedAt: item.published_at ?? null,
      symbol: item.symbol,
      summary: item.summary,
    }));

    setCachedValue(cacheKey, normalized, 300000);
    return normalized;
  });

  return data;
}
