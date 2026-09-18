import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold">User profile</h1>
      </div>

      <Card className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Name</label>
          <input className="w-full rounded-md border border-slate-200 bg-white p-3 outline-none" defaultValue="Alpha Investor" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
          <input className="w-full rounded-md border border-slate-200 bg-white p-3 outline-none" defaultValue="investor@example.com" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Theme</label>
          <select className="w-full rounded-md border border-slate-200 bg-white p-3 outline-none">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
      </Card>
    </main>
  );
}
