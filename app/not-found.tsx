import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-slate-600">The requested AlphaLens page could not be found.</p>
      <Link href="/" className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        Return home
      </Link>
    </main>
  );
}
