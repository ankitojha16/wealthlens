import { CircleAlert } from "lucide-react";
import { CompanyDetailClient } from "@/components/company/company-detail-client";
import { getCompanyResearch, getHistoricalData, getNews, getQuote } from "@/lib/market-api";

export default async function CompanyPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const [company, quote, history, news] = await Promise.all([
    getCompanyResearch(symbol),
    getQuote(symbol),
    getHistoricalData(symbol),
    getNews(symbol),
  ]);

  if (!company || !quote) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <CircleAlert className="h-5 w-5" />
          No verified data available for this symbol.
        </div>
      </main>
    );
  }

  return <CompanyDetailClient company={company} quote={quote} history={history} news={news} />;
}
