const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getMinutes(searchParams: { q?: string }) {
  const query = searchParams.q ? `?q=${encodeURIComponent(searchParams.q)}` : "";
  const res = await fetch(`${API_URL}/public/minutes${query}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function MinutesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const items = await getMinutes(searchParams);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Minutes archive
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          A searchable archive of meeting minutes published by the Secretariat.
        </p>
        <form className="mt-6">
          <input
            defaultValue={searchParams.q}
            name="q"
            placeholder="Search by title…"
            className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </form>
        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-slate-300">No minutes published yet.</p>
          ) : (
            items.map((m: any) => (
              <div
                key={m._id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs"
              >
                <div>
                  <p className="font-medium text-slate-50">{m.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {m.department || "All departments"} ·{" "}
                    {new Date(m.meetingDate).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`${API_URL}/uploads/minutes/${m.filePath}`}
                  className="rounded-md border border-slate-700 px-3 py-1 text-[11px] hover:border-emerald-400 hover:text-emerald-300"
                >
                  View PDF
                </a>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

