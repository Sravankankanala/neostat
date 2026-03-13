const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getDigest() {
  const res = await fetch(`${API_URL}/public/digest`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function DigestPage() {
  const items = await getDigest();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Quarterly Digest
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Highlights of recently resolved cases and how they translated into real change.
        </p>
        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-slate-300">
              No resolved cases have been published yet.
            </p>
          ) : (
            items.map((item: any) => (
              <article
                key={item._id}
                className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <p className="text-xs font-mono text-slate-400">
                  {item.trackingId} · {item.category} · {item.department}
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  {item.impactSummary || "Issue resolved"}
                </p>
                {item.actionTaken && (
                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-200">
                      Action:
                    </span>{" "}
                    {item.actionTaken}
                  </p>
                )}
                {item.changeOutcome && (
                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-200">
                      Outcome:
                    </span>{" "}
                    {item.changeOutcome}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

