"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }

    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">WealthLens</h1>
          <p className="mt-2 text-sm text-slate-600">WealthLens — A WealthCompass Project</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none" placeholder="name@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none" placeholder="••••••••" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-sky-700 hover:text-sky-800">Forgot password?</Link>
            <Link href="/signup" className="text-sky-700 hover:text-sky-800">Sign up</Link>
          </div>

          {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Signing in..." : "Sign in"}</Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Need an account? <Link href="/signup" className="font-medium text-sky-700">Create one</Link>
        </div>
      </div>
    </main>
  );
}
