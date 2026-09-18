import { Card } from "@/components/ui/card";
import { newsItems } from "@/lib/demo-data";

export default function NewsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">News</p>
        <h1 className="mt-2 text-3xl font-semibold">Latest market and company developments</h1>
      </div>

      <div className="space-y-4">
        {newsItems.map((item) => (
          <Card key={item.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.company}</p>
              <h2 className="mt-2 text-xl font-semibold">{item.headline}</h2>
            </div>
            <div className="text-sm text-slate-500">
              <p>{item.source}</p>
              <p>{new Date(item.publishedAt).toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
