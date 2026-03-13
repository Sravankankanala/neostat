import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight">
          NeoConnect
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Staff feedback, complaint management, polls, and analytics — all in one transparent hub.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-medium text-slate-950 shadow hover:bg-emerald-400 transition-colors"
          >
            Sign in to NeoConnect
          </Link>
          <p className="text-xs text-slate-400">
            Use the credentials provided by IT. Your access is tailored to your role (Staff, Secretariat, Case
            Manager, or Admin).
          </p>
        </div>
        <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
          <p>View public updates without logging in:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href="/hub/digest"
              className="rounded-full border border-slate-700 px-3 py-1 hover:border-emerald-500 hover:text-emerald-300 transition-colors"
            >
              Quarterly Digest
            </Link>
            <Link
              href="/hub/impact"
              className="rounded-full border border-slate-700 px-3 py-1 hover:border-emerald-500 hover:text-emerald-300 transition-colors"
            >
              Impact Tracker
            </Link>
            <Link
              href="/hub/minutes"
              className="rounded-full border border-slate-700 px-3 py-1 hover:border-emerald-500 hover:text-emerald-300 transition-colors"
            >
              Minutes Archive
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
