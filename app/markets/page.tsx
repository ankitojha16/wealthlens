import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getMarketIndices } from "@/lib/market-api";

export default async function MarketsPage() {
  const indices = await getMarketIndices();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Market dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">NIFTY 50 and major market leaders</h1>
        </div>
        <Link href="/" className="text-sm font-medium text-sky-700">Back home</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {indices.length > 0 ? indices.slice(0, 3).map((index) => (
          <Card key={index.symbol}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{index.symbol}</p>
                <h2 className="mt-1 text-xl font-semibold">₹{index.value?.toLocaleString("en-IN") ?? "Data unavailable"}</h2>
              </div>
              <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm ${Number(index.percentChange ?? 0) >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {index.percentChange === null ? <ArrowDownRight className="h-4 w-4" /> : Number(index.percentChange) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {index.percentChange === null ? "Data unavailable" : `${index.percentChange >= 0 ? "+" : ""}${index.percentChange.toFixed(2)}%`}
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">{index.name}</p>
            <p className="mt-2 text-xs text-slate-400">Last updated: {index.updatedAt ? new Date(index.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Data unavailable"}</p>
          </Card>
        )) : (
          <Card className="md:col-span-3">
            <p className="text-sm text-slate-500">Data unavailable</p>
          </Card>
        )}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Market movers</h2>
          {indices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                    <th className="pb-3 pr-4 font-medium">Symbol</th>
                    <th className="pb-3 pr-4 font-medium">Index</th>
                    <th className="pb-3 pr-4 font-medium">Value</th>
                    <th className="pb-3 pr-4 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {indices.map((index) => (
                    <tr key={index.symbol} className="border-b border-slate-100 text-slate-700 dark:border-slate-900">
                      <td className="py-3 pr-4 font-medium">{index.symbol}</td>
                      <td className="py-3 pr-4">{index.name}</td>
                      <td className="py-3 pr-4">₹{index.value?.toLocaleString("en-IN") ?? "Data unavailable"}</td>
                      <td className={`py-3 pr-4 ${Number(index.percentChange ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {index.percentChange === null ? "Data unavailable" : `${index.percentChange >= 0 ? "+" : ""}${index.percentChange.toFixed(2)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Data unavailable</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">Market status</h2>
          <div className="space-y-4 text-sm">
            {[
              { key: "SENSEX", label: "SENSEX" },
              { key: "NIFTY", label: "NIFTY" },
              { key: "BANKNIFTY", label: "Bank NIFTY" },
            ].map(({ key, label }) => {
              const item = indices.find((entry) => entry.symbol === key);
              return (
                <div key={key} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span>{item && item.value !== null && item.value !== undefined ? `₹${item.value.toLocaleString("en-IN")}` : "Data unavailable"}</span>
                </div>
              );
            })}
            <div className="flex justify-between"><span className="text-slate-500">Source</span><span>{indices[0]?.status ?? "Data unavailable"}</span></div>
          </div>
        </Card>
      </div>
    </main>
  );
}
