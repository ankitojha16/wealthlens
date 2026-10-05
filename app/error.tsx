"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl items-center justify-center px-6 py-10">
      <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h1 className="text-lg font-semibold">Market data is temporarily unavailable</h1>
        <p className="mt-2 text-sm">Please try again.</p>
        <button type="button" onClick={() => reset()} className="mt-4 rounded-md bg-amber-900 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
          Try again
        </button>
      </div>
    </main>
  );
}
