export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-7xl items-center justify-center px-6 py-10">
      <div className="flex items-center gap-3 text-sm text-slate-500" role="status" aria-live="polite">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600" />
        Loading market data...
      </div>
    </main>
  );
}
