export type CompanyRecord = {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  marketCap: number;
  price: number;
  change: number;
  percentChange: number;
  updatedAt: string;
  source: string;
  pe: number | null;
  eps: number | null;
  roe: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  revenueGrowth: number | null;
  profitGrowth: number | null;
  description: string;
};

export const companies: CompanyRecord[] = [
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    exchange: "NSE",
    sector: "IT Services",
    marketCap: 1470000000000,
    price: 4052,
    change: 58.5,
    percentChange: 1.47,
    updatedAt: "2026-09-19T10:45:00+05:30",
    source: "Delayed data",
    pe: 32.4,
    eps: 125.1,
    roe: 28.1,
    debtToEquity: 0.22,
    dividendYield: 1.4,
    profitMargin: 22.7,
    operatingMargin: 27.4,
    revenueGrowth: 12.8,
    profitGrowth: 10.6,
    description: "Global IT services and consulting business with strong digital transformation demand.",
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    exchange: "NSE",
    sector: "Diversified",
    marketCap: 2010000000000,
    price: 2912,
    change: -18.4,
    percentChange: -0.63,
    updatedAt: "2026-09-19T10:45:00+05:30",
    source: "Delayed data",
    pe: 21.8,
    eps: 133.5,
    roe: 15.9,
    debtToEquity: 0.41,
    dividendYield: 0.4,
    profitMargin: 8.6,
    operatingMargin: 12.4,
    revenueGrowth: 9.2,
    profitGrowth: 7.8,
    description: "Integrated conglomerate spanning refining, telecom, retail, and clean energy businesses.",
  },
  {
    symbol: "INFY",
    name: "Infosys",
    exchange: "NSE",
    sector: "IT Services",
    marketCap: 830000000000,
    price: 1658,
    change: 19.2,
    percentChange: 1.17,
    updatedAt: "2026-09-19T10:45:00+05:30",
    source: "Delayed data",
    pe: 27.3,
    eps: 60.8,
    roe: 31.4,
    debtToEquity: 0.12,
    dividendYield: 2.1,
    profitMargin: 20.5,
    operatingMargin: 23.9,
    revenueGrowth: 9.4,
    profitGrowth: 8.9,
    description: "Digital services and consulting company with global enterprise clients.",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    exchange: "NSE",
    sector: "Banking",
    marketCap: 1280000000000,
    price: 1721,
    change: 11.8,
    percentChange: 0.69,
    updatedAt: "2026-09-19T10:45:00+05:30",
    source: "Delayed data",
    pe: 18.4,
    eps: 93.5,
    roe: 15.4,
    debtToEquity: 0.08,
    dividendYield: 1.2,
    profitMargin: 21.1,
    operatingMargin: 0,
    revenueGrowth: 11.5,
    profitGrowth: 12.1,
    description: "Leading private-sector bank with strong retail and wholesale franchise.",
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    exchange: "NSE",
    sector: "Banking",
    marketCap: 920000000000,
    price: 1298,
    change: 22.3,
    percentChange: 1.75,
    updatedAt: "2026-09-19T10:45:00+05:30",
    source: "Delayed data",
    pe: 17.9,
    eps: 72.4,
    roe: 16.8,
    debtToEquity: 0.1,
    dividendYield: 0.7,
    profitMargin: 18.6,
    operatingMargin: 0,
    revenueGrowth: 14.2,
    profitGrowth: 16.8,
    description: "Large private sector bank focused on digital banking and retail credit.",
  },
];

export const marketOverview = {
  index: "NIFTY 50",
  value: 25584,
  change: 146.5,
  percentChange: 0.58,
  updatedAt: "2026-09-19T10:45:00+05:30",
  source: "Delayed data",
  topGainers: ["TCS", "INFY", "ICICIBANK"],
  topLosers: ["RELIANCE", "ITC", "LT"],
  mostActive: ["TCS", "RELIANCE", "HDFCBANK"],
};

export const newsItems = [
  {
    id: 1,
    headline: "Indian IT majors see strong deal pipeline in Q2 as clients prioritize digital modernization",
    source: "LiveMint",
    publishedAt: "2026-09-19T09:25:00+05:30",
    company: "TCS",
    url: "https://www.livemint.com",
  },
  {
    id: 2,
    headline: "Oil-to-telecom conglomerate retains focus on capital efficiency and debt discipline",
    source: "Economic Times",
    publishedAt: "2026-09-18T18:30:00+05:30",
    company: "RELIANCE",
    url: "https://economictimes.indiatimes.com",
  },
  {
    id: 3,
    headline: "Banking sector continues steady credit growth, supported by resilient consumer demand",
    source: "Business Standard",
    publishedAt: "2026-09-18T08:10:00+05:30",
    company: "HDFCBANK",
    url: "https://www.business-standard.com",
  },
];

export const researchQuestions = [
  "Explain the company's revenue growth.",
  "What changed in the last five years?",
  "Explain its debt position.",
  "Compare TCS and Infosys.",
  "Summarize recent company developments.",
];

export function getCompanyBySymbol(symbol: string) {
  return companies.find((company) => company.symbol.toUpperCase() === symbol.toUpperCase());
}

export function getCompanySearchResults(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return companies.filter(
    (company) =>
      company.symbol.toLowerCase().includes(normalized) ||
      company.name.toLowerCase().includes(normalized) ||
      company.sector.toLowerCase().includes(normalized),
  );
}
