const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getImpact() {
  const res = await fetch(`${API_URL}/public/impact`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function ImpactPage() {
  const items = await getImpact();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Impact Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          How staff feedback has turned into concrete actions and improvements.
        </p>
        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-slate-300">
              No impact entries yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-300">
                  <tr>
                    <th className="px-4 py-2">What was raised</th>
                    <th className="px-4 py-2">Action taken</th>
                    <th className="px-4 py-2">What changed</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => (
                    <tr
                      key={item._id}
                      className="border-t border-slate-800 align-top"
                    >
                      <td className="px-4 py-2 text-slate-200">
                        <p className="font-mono text-[11px] text-slate-400">
                          {item.trackingId} · {item.department} ·{" "}
                          {item.category}
                        </p>
                        <p className="mt-1 text-xs">
                          {item.impactSummary || "Issue raised by staff"}
                        </p>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-200">
                        {item.actionTaken || "—"}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-200">
                        {item.changeOutcome || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

