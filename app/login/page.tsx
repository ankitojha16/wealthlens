import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">WealthLens</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">A WealthCompass project</p>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="name@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input type="password" className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800" placeholder="••••••••" />
          </div>

          <Button className="w-full bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900">Sign in</Button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Need an account? <Link href="/" className="font-medium text-sky-700">Explore as guest</Link>
        </div>
      </div>
    </main>
  );
}
