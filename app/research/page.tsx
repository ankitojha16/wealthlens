import { Card } from "@/components/ui/card";
import { researchQuestions } from "@/lib/demo-data";

export default function ResearchPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">AI research</p>
        <h1 className="mt-2 text-3xl font-semibold">Ask AlphaLens</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Suggested questions</h2>
          <div className="space-y-3">
            {researchQuestions.map((question) => (
              <button key={question} className="block w-full rounded-lg border border-slate-200 p-3 text-left text-sm hover:bg-slate-50">
                {question}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Research context</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Context-aware</span>
          </div>
          <p className="text-sm text-slate-600">
            The AI assistant can use company data, valuation metrics, and recent market context to answer analytical questions. It does not generate investment recommendations.
          </p>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            Example answer: “I have sufficient company data to explain revenue growth trends, leverage, and operating performance. I do not have verified live data for every requested metric.”
          </div>
        </Card>
      </div>
    </main>
  );
}
