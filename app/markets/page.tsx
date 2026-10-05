import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getMarketMovers } from "@/lib/market-api";

export default async function MarketsPage() {
  const { gainers, losers } = await getMarketMovers();
  const dedupeBySymbol = (items: typeof gainers) => {
    const unique = new Map<string, (typeof items)[number]>();
    for (const item of items) {
      const prev = unique.get(item.symbol);
      if (!prev || (item.percentChange ?? -Infinity) > (prev.percentChange ?? -Infinity)) {
        unique.set(item.symbol, item);
      }
    }
    return [...unique.values()];
  };
  const uniqueGainers = dedupeBySymbol(gainers);
  const uniqueLosers = dedupeBySymbol(losers);
  const marketList = [...uniqueGainers, ...uniqueLosers];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#1F2937]">Market dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#000000]">Equity movers</h1>
        </div>
        <Link href="/" className="text-sm font-medium text-[#013220] hover:text-[#000000]">Back home</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {marketList.length > 0 ? marketList.slice(0, 3).map((index) => (
          <Link key={index.symbol} href={`/company/${index.symbol}`} className="block">
            <Card className="transition hover:border-emerald-300 hover:bg-[#f7fff9]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#000000]">₹{index.price?.toLocaleString("en-IN") ?? "Data unavailable"}</h2>
                  <p className="mt-1 text-sm text-[#1F2937]">{index.name}</p>
                </div>
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${Number(index.percentChange ?? 0) >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {index.percentChange === null ? <ArrowDownRight className="h-4 w-4" /> : Number(index.percentChange) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {index.percentChange === null ? "Data unavailable" : `${index.percentChange >= 0 ? "+" : ""}${index.percentChange.toFixed(2)}%`}
                </div>
              </div>
            </Card>
          </Link>
        )) : (
          <Card className="md:col-span-3">
            <p className="text-sm text-[#1F2937]">Market movers are not currently available from the configured data source.</p>
          </Card>
        )}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="mb-4 text-xl font-semibold text-[#000000]">Market movers</h2>
          {marketList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[#000000]">
                <thead>
                  <tr className="border-b border-emerald-200 text-[#1F2937]">
                    <th className="pb-3 pr-4 font-medium">Company</th>
                    <th className="pb-3 pr-4 font-medium">Value</th>
                    <th className="pb-3 pr-4 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {marketList.map((index) => (
                    <tr key={index.symbol} className="border-b border-emerald-100 text-[#111827]">
                      <td className="py-3 pr-4"><Link href={`/company/${index.symbol}`} className="font-medium text-[#000000] hover:text-[#013220] hover:underline">{index.name}</Link></td>
                      <td className="py-3 pr-4 text-[#111827]">₹{index.price?.toLocaleString("en-IN") ?? "Data unavailable"}</td>
                      <td className={`py-3 pr-4 font-medium ${Number(index.percentChange ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {index.percentChange === null ? "Data unavailable" : `${index.percentChange >= 0 ? "+" : ""}${index.percentChange.toFixed(2)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#1F2937]">No stock market data is available right now.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold text-[#000000]">Market status</h2>
          <div className="space-y-4 text-sm text-[#111827]">
            <div className="flex justify-between"><span className="text-[#1F2937]">Indices</span><span>Unavailable</span></div>
            <div className="flex justify-between"><span className="text-[#1F2937]">Gainers</span><span>{uniqueGainers.length || "Unavailable"}</span></div>
            <div className="flex justify-between"><span className="text-[#1F2937]">Losers</span><span>{uniqueLosers.length || "Unavailable"}</span></div>
          </div>
        </Card>
      </div>
    </main>
  );
}
