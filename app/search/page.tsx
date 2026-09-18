import Link from "next/link";
import { Search } from "lucide-react";
import { searchStocks } from "@/lib/market-api";

export default async function SearchPage() {
  const results = await searchStocks("TCS");

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Search company or symbol"
            defaultValue="TCS"
          />
        </div>

        <div className="mt-6 space-y-3">
          {results.length > 0 ? (
            results.map((company) => (
              <Link key={company.symbol} href={`/company/${company.symbol}`} className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-slate-500">{company.symbol} • {company.sector ?? company.exchange}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{company.price !== null ? `₹${company.price.toLocaleString("en-IN")}` : "Data unavailable"}</p>
                    <p>{company.percentChange === null ? "Status unavailable" : `${company.percentChange >= 0 ? "+" : ""}${company.percentChange.toFixed(2)}%`}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-500">Data unavailable</p>
          )}
        </div>
      </div>
    </main>
  );
}
