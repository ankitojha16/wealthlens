"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

type Holding = {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number | null;
};

const STORAGE_KEY = "wealthlens-holdings";

const defaultHoldings: Holding[] = [
  { symbol: "TCS", name: "Tata Consultancy Services", quantity: 12, avgCost: 3520, currentPrice: null },
  { symbol: "RELIANCE", name: "Reliance Industries", quantity: 8, avgCost: 2790, currentPrice: null },
  { symbol: "HDFCBANK", name: "HDFC Bank", quantity: 18, avgCost: 1645, currentPrice: null },
];

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "₹0";
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;
}

export function HoldingsManager() {
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    if (typeof window === "undefined") return defaultHoldings;

    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      if (!rawValue) return defaultHoldings;
      const parsed = JSON.parse(rawValue) as Holding[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({ ...item, currentPrice: typeof item.currentPrice === "number" ? item.currentPrice : null }));
      }
    } catch {
      // Ignore malformed local storage data.
    }

    return defaultHoldings;
  });
  const [symbol, setSymbol] = useState("TCS");
  const [name, setName] = useState("Tata Consultancy Services");
  const [quantity, setQuantity] = useState(5);
  const [avgCost, setAvgCost] = useState(3800);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
    }
  }, [holdings]);

  useEffect(() => {
    const symbols = holdings
      .filter((item) => item.symbol && item.currentPrice === null)
      .map((item) => item.symbol);

    if (symbols.length === 0) return;

    let cancelled = false;

    Promise.all(symbols.map(async (item) => {
      try {
        const response = await fetch(`/api/quote?symbol=${encodeURIComponent(item)}`);
        if (!response.ok) return { symbol: item, price: null };
        const payload = await response.json() as { price?: number | null; name?: string };
        return { symbol: item, price: typeof payload.price === "number" ? payload.price : null, name: payload.name ?? item };
      } catch {
        return { symbol: item, price: null, name: item };
      }
    })).then((results) => {
      if (cancelled) return;
      setHoldings((current) => current.map((holding) => {
        const update = results.find((entry) => entry.symbol === holding.symbol);
        if (!update) return holding;
        return {
          ...holding,
          name: update.name ?? holding.name,
          currentPrice: update.price,
        };
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [holdings]);

  const totals = useMemo(() => {
    const marketValue = holdings.reduce((sum, item) => sum + item.quantity * (item.currentPrice ?? 0), 0);
    const investedValue = holdings.reduce((sum, item) => sum + item.quantity * item.avgCost, 0);
    const pnl = marketValue - investedValue;
    const pnlPct = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
    return { marketValue, investedValue, pnl, pnlPct };
  }, [holdings]);

  function addHolding() {
    const trimmedSymbol = symbol.trim().toUpperCase();
    const trimmedName = name.trim() || "Custom holding";
    if (!trimmedSymbol || !Number(quantity) || !Number(avgCost)) return;

    setHoldings((current) => {
      const existing = current.find((holding) => holding.symbol === trimmedSymbol);
      if (existing) {
        return current.map((holding) => holding.symbol === trimmedSymbol
          ? { ...holding, quantity: holding.quantity + Number(quantity || 0), avgCost: (holding.avgCost + Number(avgCost || 0)) / 2, currentPrice: holding.currentPrice }
          : holding);
      }

      return [...current, {
        symbol: trimmedSymbol,
        name: trimmedName,
        quantity: Number(quantity || 0),
        avgCost: Number(avgCost || 0),
        currentPrice: null,
      }];
    });

    setSymbol("");
    setName("");
    setQuantity(1);
    setAvgCost(0);
  }

  function removeHolding(symbolToRemove: string) {
    setHoldings((current) => current.filter((holding) => holding.symbol !== symbolToRemove));
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Portfolio</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Holdings overview</h1>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-[#041f1d] px-3 py-1 text-xs text-emerald-100/80">
          Auto price refresh from market API
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-500/20 bg-[#013220] p-5 text-white shadow-[0_12px_28px_rgba(1,50,32,0.14)]">
          <div className="flex items-center gap-2 text-sm text-[#E5E7EB]">
            <Wallet className="h-4 w-4 text-[#89F336]" />
            Market value
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(totals.marketValue)}</p>
        </Card>
        <Card className="border-emerald-500/20 bg-[#013220] p-5 text-white shadow-[0_12px_28px_rgba(1,50,32,0.14)]">
          <div className="flex items-center gap-2 text-sm text-[#E5E7EB]">
            {totals.pnl >= 0 ? <TrendingUp className="h-4 w-4 text-[#89F336]" /> : <TrendingDown className="h-4 w-4 text-[#FF4D4D]" />}
            P/L
          </div>
          <p className={`mt-4 text-3xl font-semibold ${totals.pnl >= 0 ? "text-[#89F336]" : "text-[#FF4D4D]"}`}>
            {formatCurrency(totals.pnl)}
          </p>
        </Card>
        <Card className="border-emerald-500/20 bg-[#013220] p-5 text-white shadow-[0_12px_28px_rgba(1,50,32,0.14)]">
          <div className="flex items-center gap-2 text-sm text-[#E5E7EB]">
            <TrendingUp className="h-4 w-4 text-[#89F336]" />
            Return
          </div>
          <p className={`mt-4 text-3xl font-semibold ${totals.pnlPct >= 0 ? "text-[#89F336]" : "text-[#FF4D4D]"}`}>
            {Number.isFinite(totals.pnlPct) ? `${totals.pnlPct.toFixed(2)}%` : "—"}
          </p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-emerald-500/20 bg-[#013220] p-5 text-white shadow-[0_12px_28px_rgba(1,50,32,0.14)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Positions</h2>
            <span className="text-sm text-[#E5E7EB]">{holdings.length} holdings</span>
          </div>

          <div className="space-y-3">
            {holdings.map((holding) => {
              const value = holding.quantity * (holding.currentPrice ?? 0);
              const invested = holding.quantity * holding.avgCost;
              const pnl = value - invested;
              return (
                <div key={holding.symbol} className="flex flex-col gap-3 rounded-xl border border-emerald-500/15 bg-[#041f1d] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{holding.symbol}</p>
                    <p className="text-sm text-[#E5E7EB]">{holding.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#E5E7EB]">
                    <span>Qty {holding.quantity}</span>
                    <span>Buy {formatCurrency(holding.avgCost)}</span>
                    <span>{holding.currentPrice === null ? "Current price unavailable" : `Now ${formatCurrency(holding.currentPrice)}`}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-right">
                      <p className="font-medium text-white">{holding.currentPrice === null ? "—" : formatCurrency(value)}</p>
                      <p className={pnl >= 0 ? "text-[#89F336]" : "text-[#FF4D4D]"}>{holding.currentPrice === null ? "Current price unavailable" : `${pnl >= 0 ? "+" : ""}${formatCurrency(pnl)}`}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHolding(holding.symbol)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-sm text-red-200 hover:bg-red-500/20"
                      aria-label={`Remove ${holding.symbol}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-emerald-500/20 bg-[#013220] p-5 text-white shadow-[0_12px_28px_rgba(1,50,32,0.14)]">
          <div className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <Plus className="h-5 w-5 text-[#89F336]" />
            Add holding
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[#E5E7EB]">
              Stock symbol
              <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-emerald-500/20 bg-[#041f1d] px-3 py-2 text-white outline-none placeholder:text-emerald-100/40" placeholder="HDFCBANK" />
            </label>

            <label className="block text-sm text-[#E5E7EB]">
              Company name
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-emerald-500/20 bg-[#041f1d] px-3 py-2 text-white outline-none placeholder:text-emerald-100/40" placeholder="HDFC Bank" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-[#E5E7EB]">
                Quantity
                <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value || 0))} className="mt-1 w-full rounded-lg border border-emerald-500/20 bg-[#041f1d] px-3 py-2 text-white outline-none" />
              </label>
              <label className="block text-sm text-[#E5E7EB]">
                Buy price / share
                <input type="number" min="0" step="0.01" value={avgCost} onChange={(event) => setAvgCost(Number(event.target.value || 0))} className="mt-1 w-full rounded-lg border border-emerald-500/20 bg-[#041f1d] px-3 py-2 text-white outline-none" />
              </label>
            </div>

            <button type="button" onClick={addHolding} className="w-full rounded-lg bg-[#89F336] px-3 py-2.5 font-medium text-[#013220] hover:bg-[#9BFF4A]">
              Save holding
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
