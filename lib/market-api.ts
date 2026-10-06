import { getCachedValue, setCachedValue, withRequestDeduplication } from "./cache";
import type {
  CompanyResearch,
  HistoricalPoint,
  MarketIndex,
  MarketMover,
  NewsItem,
  Quote,
  SearchResult,
} from "./types";

const MARKET_API_BASE_URL = (process.env.MARKET_API_BASE_URL?.trim() || "https://stock.indianapi.in").replace(/\/$/, "");
const MARKET_API_KEY = process.env.MARKET_API_KEY?.trim() || process.env.INDIAN_API_KEY?.trim() || "";
const PROVIDER_NAME = "IndianAPI";
const NEWS_SYMBOLS = ["TCS", "RELIANCE", "HDFCBANK"];
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 8;
let requestTimestamps: number[] = [];
let rateLimitUntil = 0;

type IndianStockResponse = {
  tickerId?: string;
  companyName?: string;
  industry?: string;
  currentPrice?: Record<string, unknown>;
  percentChange?: unknown;
  companyProfile?: Record<string, unknown>;
  keyMetrics?: { priceandVolume?: Array<Record<string, unknown>> } | Record<string, unknown>;
  stockDetailsReusableData?: Record<string, unknown>;
  stockTechnicalData?: Array<Record<string, unknown>>;
  recentNews?: Array<Record<string, unknown>>;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function firstNumber(...values: unknown[]) {
  return values.map(toNumber).find((value) => value !== null) ?? null;
}

function hasProviderConfig() {
  return Boolean(MARKET_API_KEY);
}

function canMakeRequest() {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (now < rateLimitUntil) {
    return false;
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  requestTimestamps.push(now);
  return true;
}

async function requestJson<T>(path: string): Promise<T | null> {
  if (!hasProviderConfig() || !canMakeRequest()) return null;

  try {
    const response = await fetch(`${MARKET_API_BASE_URL}${path}`, {
      headers: { "x-api-key": MARKET_API_KEY, Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });

    if (response.status === 429) {
      const retrySeconds = Number(response.headers.get("Retry-After") || "60");
      rateLimitUntil = Date.now() + Math.max(retrySeconds * 1000, RATE_LIMIT_WINDOW_MS);
      console.warn("[market-api] Provider request was rate limited.");
      return null;
    }

    if (!response.ok) {
      console.warn(`[market-api] Provider request failed with status ${response.status}.`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn("[market-api] Provider request failed.", error);
    return null;
  }
}

function getPrice(currentPrice: Record<string, unknown> | undefined, exchange = "NSE") {
  return firstNumber(currentPrice?.[exchange], currentPrice?.NSE, currentPrice?.BSE);
}

function normalizedKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findNumberInObject(source: Record<string, unknown> | undefined, keys: string[]): number | null {
  if (!source || typeof source !== "object") return null;

  for (const key of Object.keys(source)) {
    const normalized = normalizedKey(key);
    if (keys.includes(normalized)) {
      const value = toNumber(source[key]);
      if (value !== null) return value;
    }
  }
  return null;
  return null;
}

function findPreviousCloseValue(payload: IndianStockResponse, technical?: Record<string, unknown>, details?: Record<string, unknown>) {
  const sources = [
    payload.companyProfile,
    payload.stockDetailsReusableData,
    payload.keyMetrics && typeof payload.keyMetrics === "object" ? payload.keyMetrics as Record<string, unknown> : undefined,
    details,
    technical,
  ].filter(Boolean) as Record<string, unknown>[];

  const aliasKeys = [
    "previousclose",
    "previous_close",
    "prevclose",
    "prevcloseprice",
    "lastclose",
    "closeprice",
    "close",
  ];

  for (const source of sources) {
    const found = findNumberInObject(source, aliasKeys);
    if (found !== null) return found;
  }

  return null;
}

function normalizeDisplayName(name: string | undefined, fallback: string) {
  const candidate = (name ?? fallback).trim();
  if (!candidate) return fallback;
  return candidate.replace(/^S\d+/i, "").replace(/^E\d+/i, "").trim() || fallback;
}

function extractMetricFromArray(items: unknown, keys: string[]): number | null {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    for (const key of keys) {
      const value = record[key] ?? record[key.toLowerCase()] ?? record[key.replace(/[-_\s]+/g, "")];
      const parsed = toNumber(value);
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

function extractAverageAnalystRating(payload: IndianStockResponse): string | null {
  const row = (payload.stockDetailsReusableData as Record<string, unknown> | undefined)?.stockAnalyst;
  const analysts = Array.isArray(row) ? row as Array<Record<string, unknown>> : [];
  const rated = analysts
    .filter((item) => typeof item.ratingName === "string" && item.ratingName !== "Total")
    .sort((a, b) => (toNumber(b.ratingValue) ?? 0) - (toNumber(a.ratingValue) ?? 0));
  return typeof rated[0]?.ratingName === "string" ? rated[0].ratingName : null;
}

export function resolveStockSymbol(symbol: string, exchange?: string) {
  const raw = (symbol ?? "").toString().trim();
  const normalizedExchange = (exchange ?? "").toString().trim().toUpperCase();

  if (!raw) return "";

  const stripped = raw
    .replace(/^NSE:/i, "")
    .replace(/^BSE:/i, "")
    .replace(/\.(NS|BO)$/i, "")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase();

  if (stripped) return stripped;

  if (normalizedExchange === "NSE" || normalizedExchange === "BSE") {
    return raw.replace(/\s+/g, "").toUpperCase();
  }

  return raw.replace(/\s+/g, "").toUpperCase();
}

function resolveRouteSymbol(symbol: string, payload: IndianStockResponse | Record<string, unknown> = {}) {
  const raw = typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const profile = raw.companyProfile && typeof raw.companyProfile === "object" ? raw.companyProfile as Record<string, unknown> : {};
  const exchangeCodeNse = typeof profile.exchangeCodeNse === "string" ? profile.exchangeCodeNse.trim().toUpperCase() : "";
  const exchangeCodeBse = typeof profile.exchangeCodeBse === "string" ? profile.exchangeCodeBse.trim().toUpperCase() : "";
  const nseCode = typeof raw.exchangeCodeNsi === "string" ? raw.exchangeCodeNsi.trim().toUpperCase() : "";
  const bseCode = typeof raw.exchangeCodeBse === "string" ? raw.exchangeCodeBse.trim().toUpperCase() : "";
  return resolveStockSymbol(exchangeCodeNse || nseCode || exchangeCodeBse || bseCode || symbol || "");
}

function getQuoteTimestamp(payload: IndianStockResponse): string | null {
  const candidates: unknown[] = [
    payload.companyProfile?.lastSuccessfulRefresh,
    payload.companyProfile?.lastRefreshAttempt,
    payload.stockDetailsReusableData?.updatedAt,
    payload.stockDetailsReusableData?.lastUpdated,
    payload.stockDetailsReusableData?.date,
    payload.stockTechnicalData?.[0]?.date,
    payload.stockTechnicalData?.[0]?.timestamp,
    payload.keyMetrics?.priceandVolume,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (Array.isArray(candidate)) {
      for (const entry of candidate) {
        if (entry && typeof entry === "object") {
          const maybeDate = (entry as Record<string, unknown>).value;
          if (typeof maybeDate === "string" && maybeDate.trim()) return maybeDate.trim();
        }
      }
    }
  }

  return null;
}

export function normalizeQuote(payload: IndianStockResponse, symbol: string): Quote {
  const currentPrice = payload.currentPrice ?? {};
  const technical = Array.isArray(payload.stockTechnicalData)
    ? payload.stockTechnicalData[0] as Record<string, unknown> | undefined
    : undefined;
  const details = payload.stockDetailsReusableData ?? {};
  const price = getPrice(currentPrice);
  const previousClose = findPreviousCloseValue(payload, technical, details);
  const rawPercentChange = toNumber(payload.percentChange) ?? toNumber(details.percentChange) ?? null;
  const computedChange = previousClose !== null && price !== null ? price - previousClose : null;
  const computedPercentChange = previousClose !== null && previousClose !== 0 && price !== null ? ((price - previousClose) / previousClose) * 100 : null;
  const change = toNumber(details.change) ?? toNumber(details.netChange) ?? computedChange;
  const percentChange = rawPercentChange ?? computedPercentChange;
  const open = firstNumber(details.open, details.openingPrice, technical?.open, technical?.openingPrice);
  const high = firstNumber(details.high, details.dayHigh, details.yhigh, technical?.high, technical?.dayHigh);
  const low = firstNumber(details.low, details.dayLow, details.ylow, technical?.low, technical?.dayLow);
  const volume = firstNumber(details.volume, details.totalVolume, technical?.volume, technical?.totalVolume);
  const updatedAt = getQuoteTimestamp(payload);

  return {
    symbol: resolveRouteSymbol(symbol, payload),
    name: normalizeDisplayName(payload.companyName, symbol.toUpperCase()),
    exchange: currentPrice.NSE !== undefined || currentPrice.BSE !== undefined ? (currentPrice.NSE !== undefined ? "NSE" : "BSE") : "NSE",
    price,
    previousClose,
    open,
    high,
    low,
    change,
    percentChange,
    volume,
    currency: "INR",
    status: "Delayed",
    updatedAt,
    source: PROVIDER_NAME,
  };
}

export async function getStockPayload(symbol: string): Promise<IndianStockResponse | null> {
  const value = resolveStockSymbol(symbol || "");
  if (!value) return null;
  const cacheKey = `market:stock:${value}`;
  const cached = getCachedValue<IndianStockResponse>(cacheKey);
  if (cached) return cached;

  return withRequestDeduplication(cacheKey, async () => {
    const cachedPayload = getCachedValue<IndianStockResponse>(cacheKey);
    if (cachedPayload) return cachedPayload;

    const payload = await requestJson<IndianStockResponse>(`/stock?name=${encodeURIComponent(value)}`);
    if (payload) setCachedValue(cacheKey, payload, 300000);
    return payload;
  });
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const value = resolveStockSymbol(symbol || "");
  if (!value) return null;
  const cacheKey = `market:quote:${value}`;
  const cached = getCachedValue<Quote>(cacheKey);
  if (cached) return cached;

  const data = await withRequestDeduplication(cacheKey, async () => {
    const payload = await getStockPayload(value);
    if (!payload) return null;
    const quote = normalizeQuote(payload, value);
    setCachedValue(cacheKey, quote, 300000);
    return quote;
  });

  return data;
}

export async function getCompanyResearch(symbol: string): Promise<CompanyResearch | null> {
  const value = resolveStockSymbol(symbol || "");
  const payload = await getStockPayload(value);
  if (!payload) return null;
  const profile = payload.companyProfile ?? {};
  const details = payload.stockDetailsReusableData ?? {} as Record<string, unknown>;
  const keyMetrics = payload.keyMetrics && typeof payload.keyMetrics === "object" ? payload.keyMetrics as Record<string, unknown> : {};
  const valuationMetrics = Array.isArray(keyMetrics.valuation) ? keyMetrics.valuation : [];
  const peers = Array.isArray(profile.peerCompanyList) ? profile.peerCompanyList.map((entry) => ({
    symbol: String((entry as Record<string, unknown>).tickerId ?? ""),
    name: String((entry as Record<string, unknown>).companyName ?? "Unknown"),
    price: toNumber((entry as Record<string, unknown>).price),
    percentChange: toNumber((entry as Record<string, unknown>).percentChange),
    marketCap: toNumber((entry as Record<string, unknown>).marketCap),
    priceToEarningsValueRatio: toNumber((entry as Record<string, unknown>).priceToEarningsValueRatio),
    priceToBookValueRatio: toNumber((entry as Record<string, unknown>).priceToBookValueRatio),
  })).filter((item) => item.symbol) : [];

  const marketCap = toNumber(details.marketCap) ?? toNumber(profile.marketCap) ?? extractMetricFromArray(keyMetrics.priceandVolume, ["marketCap", "marketcap"]);
  const netIncome = toNumber(details.NetIncome) ?? toNumber(details.netIncome) ?? extractMetricFromArray(keyMetrics.incomeStatement, ["netIncome", "netincome", "totalRevenue", "revenue"]);
  const dividendYield = toNumber(details.currentDividendYieldCommonStockPrimaryIssueLTM) ?? toNumber(details.dividendYield) ?? extractMetricFromArray(keyMetrics.valuation, ["dividendYield", "currentDividendYield"]);
  const debtToEquity = toNumber(details.totalDebtPerTotalEquityMostRecentQuarter) ?? toNumber(details.debtToEquity) ?? extractMetricFromArray(keyMetrics.financialstrength, ["totalDebtPerTotalEquity", "totalDebtToTotalEquity", "debtToEquity"]);
  const sectorPe = toNumber(details.sectorPriceToEarningsValueRatio) ?? toNumber(details.pPerEBasicExcludingExtraordinaryItemsTTM) ?? extractMetricFromArray(valuationMetrics, ["priceToEarningsValueRatio", "peRatio", "sectorPriceToEarningsValueRatio", "pE"]);
  const averageRating = typeof details.averageRating === "string" ? details.averageRating : extractAverageAnalystRating(payload);

  return {
    symbol: resolveRouteSymbol(value, payload),
    name: normalizeDisplayName(payload.companyName, value),
    exchange: profile.exchangeCodeNse ? "NSE" : profile.exchangeCodeBse ? "BSE" : "India",
    industry: typeof payload.industry === "string" ? payload.industry : typeof profile.mgIndustry === "string" ? profile.mgIndustry : null,
    description: typeof profile.companyDescription === "string" ? profile.companyDescription : null,
    bseCode: typeof profile.exchangeCodeBse === "string" ? profile.exchangeCodeBse : null,
    nseCode: typeof profile.exchangeCodeNse === "string" ? profile.exchangeCodeNse : null,
    marketCap,
    dividendYield,
    debtToEquity,
    netIncome,
    averageRating,
    sectorPe,
    peerCompanies: peers,
    source: PROVIDER_NAME,
  };
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const normalized = query.trim();
  if (!normalized) return [];
  const cacheKey = `market:search:${normalized.toLowerCase()}`;
  const cached = getCachedValue<SearchResult[]>(cacheKey);
  if (cached) return cached;

  const data = await withRequestDeduplication(cacheKey, async () => {
    const payload = await requestJson<Array<Record<string, unknown>>>(`/industry_search?query=${encodeURIComponent(normalized)}`);
    const results = await Promise.all((payload ?? []).slice(0, 4).map(async (item) => {
      const rawSymbol = String(item.exchangeCodeNsi ?? item.exchangeCodeNse ?? item.nseRic?.toString().replace(/\.NS$/i, "") ?? item.bseRic?.toString().replace(/\.BO$/i, "") ?? item.commonName ?? "");
      const exchange = item.exchangeCodeNsi || item.nseRic ? "NSE" : "BSE";
      const symbol = resolveStockSymbol(rawSymbol, exchange);
      const quote = symbol ? await getQuote(symbol) : null;
      return {
        symbol,
        name: normalizeDisplayName(String(item.commonName ?? quote?.name ?? "Unknown"), "Unknown"),
        exchange,
        sector: typeof item.mgSector === "string" ? item.mgSector : undefined,
        price: quote?.price ?? null,
        percentChange: quote?.percentChange ?? null,
        status: quote ? "Delayed" : "Data unavailable",
      } satisfies SearchResult;
    }));
    const filtered = results.filter((item) => item.symbol);
    setCachedValue(cacheKey, filtered, 300000);
    return filtered;
  });

  return data;
}

export function normalizeHistoricalData(payload: { datasets?: Array<{ metric?: string; values?: Array<[string, unknown, unknown?]> }> }): HistoricalPoint[] {
  const datasets = payload.datasets ?? [];
  const byDate = new Map<string, HistoricalPoint>();
  for (const dataset of datasets) {
    for (const row of dataset.values ?? []) {
      const date = row[0];
      if (typeof date !== "string") continue;
      const point = byDate.get(date) ?? { date, open: null, high: null, low: null, close: null, volume: null };
      const value = row[1];
      const metric = dataset.metric?.toLowerCase() ?? "";
      if (metric.includes("price") || metric === "close") point.close = toNumber(value);
      if (metric.includes("volume")) point.volume = toNumber(value);
      if (metric === "open") point.open = toNumber(value);
      if (metric === "high") point.high = toNumber(value);
      if (metric === "low") point.low = toNumber(value);
      byDate.set(date, point);
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function getHistoricalData(symbol: string, period: "1m" | "6m" | "1yr" | "3yr" | "5yr" | "10yr" | "max" = "1yr"): Promise<HistoricalPoint[]> {
  const value = resolveStockSymbol(symbol || "");
  if (!value) return [];
  const cacheKey = `market:history:${value}:${period}`;
  const cached = getCachedValue<HistoricalPoint[]>(cacheKey);
  if (cached) return cached;
  const data = await withRequestDeduplication(cacheKey, async () => {
    const payload = await requestJson<{ datasets?: Array<{ metric?: string; values?: Array<[string, unknown, unknown?]> }> }>(`/historical_data?stock_name=${encodeURIComponent(value)}&period=${encodeURIComponent(period)}&filter=price`);
    const history = normalizeHistoricalData(payload ?? {});
    setCachedValue(cacheKey, history, 3600000);
    return history;
  });
  return data;
}

function normalizeNewsItem(item: Record<string, unknown>, symbol: string): NewsItem | null {
  const headline = typeof item.headline === "string" ? item.headline : null;
  if (!headline) return null;
  const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata as Record<string, unknown> : undefined;
  return {
    id: String(item.id ?? `${symbol}-${headline}`),
    headline,
    source: typeof metadata?.source === "string" ? metadata.source : PROVIDER_NAME,
    url: typeof item.url === "string" ? item.url : "",
    publishedAt: typeof item.lastPublishedDate === "string" ? item.lastPublishedDate : typeof item.date === "string" ? item.date : null,
    symbol,
    summary: typeof item.summary === "string" ? item.summary : undefined,
    imageUrl: typeof item.listimage === "string" ? item.listimage : typeof item.thumbnailImage === "string" ? item.thumbnailImage : undefined,
  };
}

export async function getNews(symbol?: string): Promise<NewsItem[]> {
  const symbols = symbol ? [resolveStockSymbol(symbol || "")] : NEWS_SYMBOLS.map((item) => resolveStockSymbol(item));
  const cacheKey = `news:${symbols.join(",")}`;
  const cached = getCachedValue<NewsItem[]>(cacheKey);
  if (cached) return cached;
  const data = await withRequestDeduplication(cacheKey, async () => {
    const payloads = await Promise.all(symbols.map((item) => getStockPayload(item)));
    const items = payloads.flatMap((payload, index) => (payload?.recentNews ?? []).map((item) => normalizeNewsItem(item, symbols[index])).filter((item): item is NewsItem => item !== null));
    const unique = [...new Map(items.map((item) => [item.id, item])).values()].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")).slice(0, 12);
    setCachedValue(cacheKey, unique, 300000);
    return unique;
  });
  return data;
}

export async function getMarketIndices(): Promise<MarketIndex[]> {
  return [];
}

export function normalizeMarketMover(item: Record<string, unknown>): MarketMover | null {
  const rawSymbol = String(item.ric ?? item.symbol ?? item.exchangeCodeNsi ?? item.exchangeCodeNse ?? item.ticker_id ?? "").trim();
  const symbol = rawSymbol.replace(/\.(NS|BO)$/i, "").replace(/^NSE:/i, "").replace(/^BSE:/i, "").trim().toUpperCase();
  const name = String(item.company_name ?? item.companyName ?? item.name ?? "Unknown").trim() || "Unknown";

  if (!symbol || !name) return null;

  return {
    symbol,
    name,
    exchange: String(item.exchange_type ?? item.exchange ?? "India"),
    price: toNumber(item.price ?? item.lastPrice ?? item.ltp),
    change: toNumber(item.net_change ?? item.change ?? item.netChange),
    percentChange: toNumber(item.percent_change ?? item.percentChange ?? item.changePercent),
    open: toNumber(item.open),
    high: toNumber(item.high),
    low: toNumber(item.low),
    volume: toNumber(item.volume),
  };
}

export async function getMarketMovers(): Promise<{ gainers: MarketMover[]; losers: MarketMover[] }> {
  const payload = await requestJson<{ trending_stocks?: { top_gainers?: Array<Record<string, unknown>>; top_losers?: Array<Record<string, unknown>> } }>('/trending');
  const normalize = (items: Array<Record<string, unknown>> = []): MarketMover[] => {
    const unique = new Map<string, MarketMover>();
    for (const item of items) {
      const normalized = normalizeMarketMover(item);
      if (!normalized) continue;
      const existing = unique.get(normalized.symbol);
      if (!existing || (normalized.percentChange ?? -Infinity) > (existing.percentChange ?? -Infinity)) {
        unique.set(normalized.symbol, normalized);
      }
    }
    return [...unique.values()].sort((a, b) => (b.percentChange ?? -Infinity) - (a.percentChange ?? -Infinity));
  };
  return { gainers: normalize(payload?.trending_stocks?.top_gainers), losers: normalize(payload?.trending_stocks?.top_losers).reverse() };
}
