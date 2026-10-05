import Link from "next/link";
import { Card } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function SettingsPage() {
  const { data: { user } } = await (await getSupabaseServerClient()).auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold">Account</h1>
        </div>
        <Link href="/" className="text-sm font-medium text-sky-700">Back home</Link>
      </div>

      <Card className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Account email</p>
          <p className="mt-2 text-lg font-medium">{user.email ?? "Email unavailable"}</p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium">Security</p>
          <p className="mt-2 text-sm text-slate-600">Password recovery is handled by Supabase. Use the recovery flow from the login page to reset your password securely.</p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium">Session</p>
          <p className="mt-2 text-sm text-slate-600">Use the log out button in the header to end your current session.</p>
        </div>
      </Card>
    </main>
  );
}
