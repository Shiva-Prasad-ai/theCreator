import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-12 text-zinc-100">
      <main className="flex w-full max-w-2xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          CreatorOS AI — Hackathon Prototype Ready
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          CreatorOS AI
        </h1>
        <p className="mt-4 text-base text-zinc-400 sm:text-lg">
          Next.js App Router scaffolded with Supabase SSR clients, typed AI Gateway wrapper, and shadcn/ui components.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="default" size="default">
            Documentation
          </Button>
          <Button variant="outline" size="default">
            AI Gateway Health
          </Button>
        </div>

        <div className="mt-12 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5">
            <h3 className="font-semibold text-zinc-200">Supabase SSR Core</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Browser & server clients configured using <code>@supabase/ssr</code>.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5">
            <h3 className="font-semibold text-zinc-200">AI Gateway Client</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Typed wrapper for <code>/v1/health</code> & <code>/v1/generate</code> with mock mode support.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
