'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type UserRole = "STAFF" | "SECRETARIAT" | "CASE_MANAGER" | "ADMIN";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

interface CaseItem {
  _id: string;
  trackingId: string;
  title: string;
  category: string;
  department: string;
  status: string;
  severity: string;
}

interface PollItem {
  _id: string;
  question: string;
  options: { _id: string; text: string; votes: number }[];
  isActive: boolean;
}

interface AnalyticsSummary {
  byDepartment: { _id: string; count: number }[];
  byStatus: { _id: string; count: number }[];
  byCategory: { _id: string; count: number }[];
  hotspots: { _id: { department: string; category: string }; count: number }[];
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("neoconnect_token");
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [polls, setPolls] = useState<PollItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [tab, setTab] = useState<"cases" | "polls" | "analytics">("cases");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function bootstrap() {
      try {
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        const currentUser: User = {
          id: meData._id,
          name: meData.name,
          email: meData.email,
          role: meData.role,
          department: meData.department,
        };
        setUser(currentUser);

        if (currentUser.role === "STAFF") {
          const myCasesRes = await fetch(`${API_URL}/cases/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (myCasesRes.ok) {
            setCases(await myCasesRes.json());
          }
        } else if (currentUser.role === "SECRETARIAT" || currentUser.role === "ADMIN") {
          const inboxRes = await fetch(`${API_URL}/cases/inbox`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (inboxRes.ok) {
            setCases(await inboxRes.json());
          }
          const analyticsRes = await fetch(`${API_URL}/analytics/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (analyticsRes.ok) {
            setAnalytics(await analyticsRes.json());
          }
        } else if (currentUser.role === "CASE_MANAGER") {
          const assignedRes = await fetch(`${API_URL}/cases/assigned`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (assignedRes.ok) {
            setCases(await assignedRes.json());
          }
        }

        const pollsRes = await fetch(`${API_URL}/polls`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (pollsRes.ok) {
          setPolls(await pollsRes.json());
        }
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("neoconnect_token");
    localStorage.removeItem("neoconnect_user");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
        <p className="text-sm text-slate-300">Loading dashboard…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div>
            <p className="text-sm font-semibold">NeoConnect</p>
            <p className="text-xs text-slate-400">
              {user.name} · {user.role}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Button
              onClick={() => setTab("cases")}
              variant={tab === "cases" ? "default" : "outline"}
              size="sm"
            >
              Cases
            </Button>
            <Button
              onClick={() => setTab("polls")}
              variant={tab === "polls" ? "default" : "outline"}
              size="sm"
            >
              Polls
            </Button>
            {(user.role === "SECRETARIAT" || user.role === "ADMIN") && (
              <Button
                onClick={() => setTab("analytics")}
                variant={tab === "analytics" ? "default" : "outline"}
                size="sm"
              >
                Analytics
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="ml-4 border-red-600 text-red-200 hover:bg-red-950 hover:text-red-100"
            >
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        <QuickActions user={user} />
        {tab === "cases" && <CasesPane user={user} cases={cases} />}
        {tab === "polls" && <PollsPane user={user} polls={polls} />}
        {tab === "analytics" && analytics && (
          <AnalyticsPane analytics={analytics} />
        )}
      </main>
    </div>
  );
}

function QuickActions({ user }: { user: User }) {
  if (user.role === "STAFF") {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-200">
        <p className="font-semibold text-slate-50">What would you like to do?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => (window.location.href = "/cases/new")}>
            Submit feedback / complaint
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = "/hub/digest")}
          >
            View quarterly digest
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = "/hub/impact")}
          >
            See impact tracker
          </Button>
        </div>
      </section>
    );
  }

  if (user.role === "SECRETARIAT" || user.role === "ADMIN") {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-200">
        <p className="font-semibold text-slate-50">Key actions for you</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Review case inbox
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = "/polls/new")}
          >
            Create a poll
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = "/minutes/new")}
          >
            Upload meeting minutes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = "/hub/impact")}
          >
            Show public impact
          </Button>
        </div>
      </section>
    );
  }

  if (user.role === "CASE_MANAGER") {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-200">
        <p className="font-semibold text-slate-50">Your responsibilities</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => (window.location.href = "/dashboard")}
          >
            View assigned cases
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = "/hub/digest")}
          >
            See recent resolutions
          </Button>
        </div>
      </section>
    );
  }

  return null;
}

function CasesPane({ user, cases }: { user: User; cases: CaseItem[] }) {
  if (user.role === "STAFF") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My submissions</h2>
          <a
            href="/cases/new"
            className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-slate-950 hover:bg-emerald-400"
          >
            New submission
          </a>
        </div>
        <CasesTable cases={cases} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        {user.role === "CASE_MANAGER" ? "Assigned cases" : "All cases"}
      </h2>
      <CasesTable cases={cases} />
      <p className="mt-2 text-xs text-slate-500">
        Assign and update cases from the detailed views (API implemented).
      </p>
    </div>
  );
}

function CasesTable({ cases }: { cases: CaseItem[] }) {
  if (!cases.length) {
    return (
      <p className="text-sm text-slate-300">
        No cases yet. Once a staff member submits feedback, it will appear here.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-slate-900/80 text-slate-300">
          <tr>
            <th className="px-4 py-2">Tracking ID</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Department</th>
            <th className="px-4 py-2">Severity</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr
              key={c._id}
              className="border-t border-slate-800 hover:bg-slate-900/80 cursor-pointer"
              onClick={() => {
                window.location.href = `/cases/${c._id}`;
              }}
            >
              <td className="px-4 py-2 font-mono text-[11px] text-slate-300">
                {c.trackingId}
              </td>
              <td className="px-4 py-2 text-slate-100">{c.title}</td>
              <td className="px-4 py-2 text-slate-200">{c.category}</td>
              <td className="px-4 py-2 text-slate-200">{c.department}</td>
              <td className="px-4 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    c.severity === "High"
                      ? "bg-red-500/20 text-red-300"
                      : c.severity === "Medium"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {c.severity}
                </span>
              </td>
              <td className="px-4 py-2">
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-200">
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PollsPane({ user, polls }: { user: User; polls: PollItem[] }) {
  const token = getToken();

  async function vote(pollId: string, optionId: string) {
    if (!token) return;
    await fetch(`${API_URL}/polls/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pollId, optionId }),
    });
    window.location.reload();
  }

  if (!polls.length) {
    return (
      <div className="space-y-2 text-sm text-slate-300">
        <p>No polls yet.</p>
        {(user.role === "SECRETARIAT" || user.role === "ADMIN") && (
          <p>
            Use the{" "}
            <button
              className="underline decoration-emerald-400 decoration-1 underline-offset-2"
              onClick={() => (window.location.href = "/polls/new")}
            >
              New poll
            </button>{" "}
            page to ask a question to staff.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Company polls</h2>
        {(user.role === "SECRETARIAT" || user.role === "ADMIN") && (
          <a
            href="/polls/new"
            className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-slate-950 hover:bg-emerald-400"
          >
            New poll
          </a>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce(
            (sum, o) => sum + o.votes,
            0
          );
          return (
            <div
              key={poll._id}
              className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <p className="text-sm font-medium text-slate-50">
                {poll.question}
              </p>
              <div className="space-y-2">
                {poll.options.map((opt) => {
                  const pct =
                    totalVotes === 0
                      ? 0
                      : Math.round((opt.votes / totalVotes) * 100);
                  return (
                    <button
                      key={opt._id}
                      onClick={() =>
                        user.role === "STAFF" && vote(poll._id, opt._id)
                      }
                      className="block w-full text-left"
                    >
                      <div className="relative h-7 overflow-hidden rounded-full border border-slate-800 bg-slate-900 text-[11px]">
                        <div
                          className="absolute inset-y-0 left-0 bg-emerald-500/30"
                          style={{ width: `${pct}%` }}
                        />
                        <div className="relative flex h-full items-center justify-between px-3 text-slate-100">
                          <span>{opt.text}</span>
                          <span className="tabular-nums text-slate-300">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                {totalVotes} vote{totalVotes === 1 ? "" : "s"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsPane({ analytics }: { analytics: AnalyticsSummary }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold">By department</h3>
        <ul className="mt-2 space-y-1 text-xs text-slate-200">
          {analytics.byDepartment.map((row) => (
            <li
              key={row._id}
              className="flex items-center justify-between"
            >
              <span>{row._id}</span>
              <span className="font-mono text-[11px] text-slate-300">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold">By status</h3>
        <ul className="mt-2 space-y-1 text-xs text-slate-200">
          {analytics.byStatus.map((row) => (
            <li
              key={row._id}
              className="flex items-center justify-between"
            >
              <span>{row._id}</span>
              <span className="font-mono text-[11px] text-slate-300">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold">Hotspots</h3>
        {analytics.hotspots.length === 0 ? (
          <p className="mt-2 text-xs text-slate-300">
            No hotspots (≥5 cases) detected.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs text-slate-200">
            {analytics.hotspots.map((row) => (
              <li
                key={`${row._id.department}-${row._id.category}`}
                className="flex items-center justify-between"
              >
                <span>
                  {row._id.department} · {row._id.category}
                </span>
                <span className="font-mono text-[11px] text-red-300">
                  {row.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

