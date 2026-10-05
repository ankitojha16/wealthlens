"use client";

import { useState } from "react";

const RANGES = [
  { label: "1M", value: "1M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "12M" },
  { label: "5Y", value: "60M" },
];

function getTradingViewSymbol(symbol: string, exchange: "NSE" | "BSE") {
  const normalized = symbol.trim().toUpperCase();
  return /^[A-Z0-9]+$/.test(normalized) ? `${exchange}:${normalized}` : null;
}

export function TradingViewChart({ symbol, exchange = "NSE" }: { symbol: string; exchange?: string }) {
  const [range, setRange] = useState("12M");
  const tradingViewSymbol = getTradingViewSymbol(symbol, exchange === "BSE" ? "BSE" : "NSE");

  if (!tradingViewSymbol) {
    return <p className="text-sm text-slate-500">TradingView does not support this symbol format.</p>;
  }

  const embedUrl = new URL("https://www.tradingview.com/widgetembed/");
  embedUrl.searchParams.set("symbol", tradingViewSymbol);
  embedUrl.searchParams.set("interval", "D");
  embedUrl.searchParams.set("range", range);
  embedUrl.searchParams.set("hidetoptoolbar", "1");
  embedUrl.searchParams.set("hidesidetoolbar", "1");
  embedUrl.searchParams.set("allow_symbol_change", "0");
  embedUrl.searchParams.set("saveimage", "0");
  embedUrl.searchParams.set("theme", "light");
  embedUrl.searchParams.set("style", "1");
  embedUrl.searchParams.set("locale", "en");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Price chart</h2>
          <p className="mt-1 text-xs text-slate-500">TradingView chart for {tradingViewSymbol}</p>
        </div>
        <div className="flex gap-1 rounded-md border border-slate-200 p-1">
          {RANGES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setRange(item.value)}
              className={`rounded px-2 py-1 text-xs ${range === item.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              aria-pressed={range === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative aspect-[16/9] min-h-[280px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <ChartFrame key={`${tradingViewSymbol}-${range}`} symbol={tradingViewSymbol} embedUrl={embedUrl.toString()} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Charts powered by TradingView. Market data and chart availability are subject to provider coverage.</p>
    </div>
  );
}

function ChartFrame({ symbol, embedUrl }: { symbol: string; embedUrl: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {isLoading && !hasError ? <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500" role="status">Loading chart...</div> : null}
      {hasError ? <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-500">TradingView could not load this symbol. Verified market data remains available above.</div> : null}
      <iframe
        title={`TradingView chart for ${symbol}`}
        src={embedUrl}
        className={`h-full w-full border-0 ${hasError ? "hidden" : ""}`}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </>
  );
}
