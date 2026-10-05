import { describe, expect, it } from "vitest";
import { normalizeHistoricalData, normalizeQuote, resolveStockSymbol } from "./market-api";

describe("IndianAPI normalization", () => {
  it("normalizes an NSE quote without inventing unavailable fields", () => {
    const quote = normalizeQuote({
      tickerId: "TCS",
      companyName: "Tata Consultancy Services",
      currentPrice: { NSE: 3500, BSE: 3501 },
      percentChange: "1.25",
      stockTechnicalData: [{ previousClose: 3456, open: 3470, high: 3520, low: 3460, volume: 1200000 }],
    }, "TCS");

    expect(quote).toMatchObject({
      symbol: "TCS",
      exchange: "NSE",
      price: 3500,
      previousClose: 3456,
      change: 44,
      percentChange: 1.25,
      volume: 1200000,
      source: "IndianAPI",
    });
  });

  it("keeps real HDFCBANK quote data intact even with string prices and negative changes", () => {
    const quote = normalizeQuote({
      companyName: "HDFC Bank",
      currentPrice: { NSE: "713", BSE: "713.00" },
      percentChange: "-1.30",
      stockTechnicalData: [{ previousClose: 730, open: 720, high: 719.35, low: 713, volume: 1234567 }],
    }, "HDFCBANK");

    expect(quote).toMatchObject({
      symbol: "HDFCBANK",
      name: "HDFC Bank",
      price: 713,
      previousClose: 730,
      change: -17,
      percentChange: -1.3,
      volume: 1234567,
    });
  });

  it("calculates change and percentage when previous close is available but the provider omits delta fields", () => {
    const quote = normalizeQuote({
      companyName: "HDFC Bank",
      currentPrice: { NSE: "713" },
      stockTechnicalData: [{ previousClose: 730 }],
    }, "HDFCBANK");

    expect(quote.symbol).toBe("HDFCBANK");
    expect(quote.change).toBe(-17);
    expect(quote.percentChange).toBeCloseTo(-2.328767123, 5);
  });

  it("reads previous close from provider alias keys nested in details objects without inventing values", () => {
    const quote = normalizeQuote({
      companyName: "HDFC Bank",
      currentPrice: { NSE: "713" },
      stockDetailsReusableData: {
        previous_close: "730",
        percentChange: "-1.30",
      },
    }, "HDFCBANK");

    expect(quote.previousClose).toBe(730);
    expect(quote.change).toBe(-17);
    expect(quote.percentChange).toBe(-1.3);
  });

  it("resolves a canonical ticker from common company names and exchange codes", () => {
    expect(resolveStockSymbol("HDFC Bank", "NSE")).toBe("HDFCBANK");
    expect(resolveStockSymbol("HDFCBANK.NS", "NSE")).toBe("HDFCBANK");
  });

  it("combines documented historical datasets by date", () => {
    const history = normalizeHistoricalData({
      datasets: [
        { metric: "Price", values: [["2025-01-01", "100"], ["2025-01-02", "101"]] },
        { metric: "Volume", values: [["2025-01-01", 500], ["2025-01-02", 600]] },
      ],
    });

    expect(history).toEqual([
      { date: "2025-01-01", open: null, high: null, low: null, close: 100, volume: 500 },
      { date: "2025-01-02", open: null, high: null, low: null, close: 101, volume: 600 },
    ]);
  });
});