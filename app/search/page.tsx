import Link from "next/link";
import { Search } from "lucide-react";
import { searchStocks } from "@/lib/market-api";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const results = await searchStocks(query);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-3xl font-semibold text-[#000000]">Search</h1>

        <form method="get" className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-white p-3 shadow-sm">
          <Search className="h-5 w-5 text-[#111827]" />
          <input
            name="q"
            required
            className="w-full bg-white text-sm text-[#000000] outline-none placeholder:text-[#374151]"
            placeholder="Search company name"
            defaultValue={query}
          />
          <button type="submit" className="rounded-lg border border-emerald-300 bg-[#ebfff0] px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#dfffe7]">
            Search
          </button>
        </form>

        {query ? (
          <div className="mt-6 space-y-3">
            {results.length > 0 ? (
              results.map((company) => (
                <Link key={company.symbol} href={`/company/${company.symbol}`} className="block rounded-lg border border-emerald-200 bg-[#f9fffa] p-3 transition hover:border-emerald-400 hover:bg-[#f2fff5]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#000000]">{company.name}</p>
                      <p className="text-sm text-[#1F2937]">{company.symbol} • {company.exchange}</p>
                    </div>
                    <div className="text-right text-sm text-[#1F2937]">
                      <p>{company.price !== null ? `₹${company.price.toLocaleString("en-IN")}` : "—"}</p>
                      <p className={company.percentChange !== null && company.percentChange >= 0 ? "text-emerald-600" : company.percentChange !== null ? "text-red-600" : "text-[#1F2937]"}>
                        {company.percentChange === null ? "—" : `${company.percentChange >= 0 ? "+" : ""}${company.percentChange.toFixed(2)}%`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-emerald-300 bg-[#f9fffa] p-5 text-sm text-[#1F2937]">
                No matching companies were returned by the current data source.
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-emerald-300 bg-[#f9fffa] p-5 text-sm text-[#1F2937]">
            Enter a company name or stock symbol to see matching companies.
          </p>
        )}
      </div>
    </main>
  );
}
