"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [favoriteFruit, setFavoriteFruit] = useState("");
  const [favoriteColour, setFavoriteColour] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Authentication is not configured in the current deployment.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          favorite_fruit: favoriteFruit,
          favorite_colour: favoriteColour,
        },
      },
    });
    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Account created. Check your inbox for the confirmation email if your Supabase project is configured for email sign-up.");
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Join WealthLens</h1>
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
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
            <input type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none" placeholder="••••••••" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Favorite fruit</label>
            <input type="text" required value={favoriteFruit} onChange={(event) => setFavoriteFruit(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none" placeholder="Mango" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Favorite colour</label>
            <input type="text" required value={favoriteColour} onChange={(event) => setFavoriteColour(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none" placeholder="Blue" />
          </div>

          {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

          <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-medium text-sky-700">Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
