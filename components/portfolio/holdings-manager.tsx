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

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "₹0";
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;
}

export function HoldingsManager() {
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      if (rawValue) {
        const parsed = JSON.parse(rawValue) as Holding[];
        if (Array.isArray(parsed)) {
          return parsed.map((item) => ({ ...item, currentPrice: typeof item.currentPrice === "number" ? item.currentPrice : null }));
        }
      }
    } catch {
      // Ignore malformed local storage data.
    }

    return [];
  });
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [avgCost, setAvgCost] = useState(0);

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
          <h1 className="mt-2 text-3xl font-semibold" style={{ color: "#013220" }}>Holdings overview</h1>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-[#041f1d] px-3 py-1 text-xs text-emerald-100/80">
          Auto price refresh from market API
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#f3c6d9] bg-[#fff1f6] p-5 text-[#3d1d2b] shadow-[0_12px_28px_rgba(1,50,32,0.08)]">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4" style={{ color: "#be185d" }} />
            Market value
          </div>
          <p className="mt-4 text-3xl font-semibold" style={{ color: "#3d1d2b" }}>{formatCurrency(totals.marketValue)}</p>
        </Card>
        <Card className="border-[#f3c6d9] bg-[#fff1f6] p-5 text-[#3d1d2b] shadow-[0_12px_28px_rgba(1,50,32,0.08)]">
          <div className="flex items-center gap-2 text-sm">
            {totals.pnl >= 0 ? <TrendingUp className="h-4 w-4 text-[#15803d]" /> : <TrendingDown className="h-4 w-4 text-[#b91c1c]" />}
            P/L
          </div>
          <p className="mt-4 text-3xl font-semibold" style={{ color: totals.pnl >= 0 ? "#15803d" : "#b91c1c" }}>
            {formatCurrency(totals.pnl)}
          </p>
        </Card>
        <Card className="border-[#f3c6d9] bg-[#fff1f6] p-5 text-[#3d1d2b] shadow-[0_12px_28px_rgba(1,50,32,0.08)]">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" style={{ color: "#be185d" }} />
            Return
          </div>
          <p className="mt-4 text-3xl font-semibold" style={{ color: totals.pnlPct >= 0 ? "#15803d" : "#b91c1c" }}>
            {Number.isFinite(totals.pnlPct) ? `${totals.pnlPct.toFixed(2)}%` : "—"}
          </p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-[#f3c6d9] bg-[#fff1f6] p-5 text-[#3d1d2b] shadow-[0_12px_28px_rgba(1,50,32,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: "#3d1d2b" }}>Positions</h2>
            <span className="text-sm" style={{ color: "#694252" }}>{holdings.length} holdings</span>
          </div>

          <div className="space-y-3">
            {holdings.length === 0 ? (
              <p className="rounded-xl border border-dashed p-4 text-sm" style={{ borderColor: "#e9a9c3", backgroundColor: "#fff8fb", color: "#694252" }}>
                No holdings yet. Add a company you own to start tracking your portfolio.
              </p>
            ) : holdings.map((holding) => {
              const value = holding.quantity * (holding.currentPrice ?? 0);
              const invested = holding.quantity * holding.avgCost;
              const pnl = value - invested;
              return (
                <div key={holding.symbol} className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: "#f3c6d9", backgroundColor: "#fff8fb", color: "#3d1d2b" }}>
                  <div>
                    <p className="text-lg font-semibold" style={{ color: "#3d1d2b" }}>{holding.symbol}</p>
                    <p className="text-sm" style={{ color: "#694252" }}>{holding.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "#694252" }}>
                    <span>Qty {holding.quantity}</span>
                    <span>Buy {formatCurrency(holding.avgCost)}</span>
                    <span>{holding.currentPrice === null ? "Current price unavailable" : `Now ${formatCurrency(holding.currentPrice)}`}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-right">
                      <p className="font-medium" style={{ color: "#3d1d2b" }}>{holding.currentPrice === null ? "—" : formatCurrency(value)}</p>
                      <p style={{ color: pnl >= 0 ? "#15803d" : "#b91c1c" }}>{holding.currentPrice === null ? "Current price unavailable" : `${pnl >= 0 ? "+" : ""}${formatCurrency(pnl)}`}</p>
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

        <Card className="border-[#f3c6d9] bg-[#fff1f6] p-5 text-[#3d1d2b] shadow-[0_12px_28px_rgba(1,50,32,0.08)]">
          <div className="mb-4 flex items-center gap-2 text-xl font-semibold" style={{ color: "#3d1d2b" }}>
            <Plus className="h-5 w-5" style={{ color: "#be185d" }} />
            Add holding
          </div>

          <div className="space-y-3">
            <label className="block text-sm" style={{ color: "#694252" }}>
              Stock symbol
              <input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border px-3 py-2 outline-none" style={{ borderColor: "#e9a9c3", backgroundColor: "#fffafd", color: "#27131c" }} placeholder="e.g. HDFCBANK" />
            </label>

            <label className="block text-sm" style={{ color: "#694252" }}>
              Company name
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 outline-none" style={{ borderColor: "#e9a9c3", backgroundColor: "#fffafd", color: "#27131c" }} placeholder="e.g. HDFC Bank" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm" style={{ color: "#694252" }}>
                Quantity
                <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value || 0))} className="mt-1 w-full rounded-lg border px-3 py-2 outline-none" style={{ borderColor: "#e9a9c3", backgroundColor: "#fffafd", color: "#27131c" }} />
              </label>
              <label className="block text-sm" style={{ color: "#694252" }}>
                Buy price / share
                <input type="number" min="0" step="0.01" value={avgCost} onChange={(event) => setAvgCost(Number(event.target.value || 0))} className="mt-1 w-full rounded-lg border px-3 py-2 outline-none" style={{ borderColor: "#e9a9c3", backgroundColor: "#fffafd", color: "#27131c" }} />
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
