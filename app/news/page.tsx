import { Card } from "@/components/ui/card";
import { getNews } from "@/lib/market-api";

export default async function NewsPage() {
  const newsItems = await getNews();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">News</p>
        <h1 className="mt-2 text-3xl font-semibold">Latest market and company developments</h1>
      </div>

      <div className="space-y-4">
        {newsItems.length > 0 ? newsItems.map((item) => (
          <Card key={item.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <a href={item.url || undefined} target={item.url ? "_blank" : undefined} rel={item.url ? "noreferrer" : undefined} className="block text-xl font-semibold hover:text-sky-700">{item.headline}</a>
              {item.summary ? <p className="mt-2 text-sm text-slate-600">{item.summary}</p> : null}
            </div>
            <div className="text-sm text-slate-500">
              <p>{item.source ? item.source : "Market update"}</p>
              <p>{item.publishedAt ? new Date(item.publishedAt).toLocaleString() : "Date unavailable"}</p>
            </div>
          </Card>
        )) : <p className="text-sm text-slate-500">News is temporarily unavailable from the current data source.</p>}
      </div>
    </main>
  );
}
