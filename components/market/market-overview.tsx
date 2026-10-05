import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { MarketIndex } from "@/lib/types";
import { formatCompactNumber, formatPercent } from "@/lib/utils";

export function MarketOverview({ indices }: { indices: MarketIndex[] }) {
  const primary = indices[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{primary?.name ?? "Market index"}</p>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-semibold">₹{primary?.value ? formatCompactNumber(primary.value) : "Data unavailable"}</p>
              <p className="mt-2 text-sm text-slate-500">Updated {primary?.updatedAt ? new Date(primary.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Data unavailable"}</p>
            </div>
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${Number(primary?.percentChange ?? 0) >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {Number(primary?.percentChange ?? 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {primary?.percentChange === null || primary?.percentChange === undefined ? "Data unavailable" : formatPercent(primary.percentChange)}
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Top Gainers</p>
          <div className="mt-4 space-y-2">
            {indices.slice(0, 3).map((item) => (
              <div key={item.symbol} className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-emerald-600">{item.percentChange === null ? "—" : `${item.percentChange >= 0 ? "+" : ""}${item.percentChange.toFixed(2)}%`}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Top Losers</p>
          <div className="mt-4 space-y-2">
            {indices.slice(0, 3).map((item) => (
              <div key={item.symbol} className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-red-600">{item.percentChange === null ? "—" : `${item.percentChange < 0 ? "" : "-"}${Math.abs(item.percentChange).toFixed(2)}%`}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
