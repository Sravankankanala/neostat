'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type UserRole = "STAFF" | "SECRETARIAT" | "CASE_MANAGER" | "ADMIN";

interface User {
  id: string;
  role: UserRole;
}

interface CaseDetail {
  _id: string;
  trackingId: string;
  title: string;
  description: string;
  status: string;
  department: string;
  category: string;
  severity: string;
  impactSummary?: string;
  actionTaken?: string;
  changeOutcome?: string;
  assignedTo?: { _id: string; name: string } | null;
}

interface Manager {
  _id: string;
  name: string;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("neoconnect_token");
}

function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("neoconnect_user");
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return { id: parsed.id, role: parsed.role };
}

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [status, setStatus] = useState<string>("IN_PROGRESS");
  const [note, setNote] = useState("");
  const [impactSummary, setImpactSummary] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [changeOutcome, setChangeOutcome] = useState("");
  const [managerId, setManagerId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const res = await fetch(`${API_URL}/cases/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Unable to load case");
        }
        const data = await res.json();
        setDetail(data);
        setStatus(data.status);
        setImpactSummary(data.impactSummary || "");
        setActionTaken(data.actionTaken || "");
        setChangeOutcome(data.changeOutcome || "");
        if (data.assignedTo?._id) {
          setManagerId(data.assignedTo._id);
        }

        if (u && (u.role === "SECRETARIAT" || u.role === "ADMIN")) {
          const mgrRes = await fetch(`${API_URL}/users/case-managers`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (mgrRes.ok) {
            setManagers(await mgrRes.json());
          }
        }
      } catch (e: any) {
        setError(e.message || "Failed to load");
      }
    }

    load();
  }, [params.id, router]);

  if (!detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
        <p className="text-sm text-slate-300">Loading case…</p>
      </div>
    );
  }

  const canAssign =
    user && (user.role === "SECRETARIAT" || user.role === "ADMIN");
  const canUpdate =
    user &&
    (user.role === "CASE_MANAGER" ||
      user.role === "SECRETARIAT" ||
      user.role === "ADMIN");

  async function handleAssign() {
    if (!canAssign || !detail) return;
    const token = getToken();
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/cases/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseId: detail._id,
          caseManagerId: managerId,
        }),
      });
      if (!res.ok) {
        throw new Error("Unable to assign");
      }
      const updated = await res.json();
      setDetail(updated);
    } catch (e: any) {
      setError(e.message || "Failed to assign");
    }
  }

  async function handleUpdate() {
    if (!canUpdate || !detail) return;
    const token = getToken();
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/cases/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseId: detail._id,
          status,
          note,
          impactSummary,
          actionTaken,
          changeOutcome,
        }),
      });
      if (!res.ok) {
        throw new Error("Unable to update case");
      }
      const updated = await res.json();
      setDetail(updated);
      setNote("");
    } catch (e: any) {
      setError(e.message || "Failed to update");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
        <div className="space-y-2">
          <p className="font-mono text-xs text-slate-400">
            {detail.trackingId} · {detail.department} · {detail.category}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {detail.title}
          </h1>
          <p className="text-sm text-slate-200">{detail.description}</p>
          <p className="text-xs text-slate-400">
            Severity: {detail.severity} · Status: {detail.status}
          </p>
        </div>

        {canAssign && (
          <section className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-50">
              Assignment
            </h2>
            <p className="text-xs text-slate-300">
              Choose a Case Manager responsible for this case.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-50"
              >
                <option value="">Unassigned</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                onClick={handleAssign}
                disabled={!managerId}
              >
                Assign
              </Button>
            </div>
          </section>
        )}

        {canUpdate && (
          <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-50">
              Case progress & impact
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-50"
                >
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="PENDING">Pending</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300">
                  Internal note (not public)
                </label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-300">
                  Impact summary (what was raised)
                </label>
                <Textarea
                  value={impactSummary}
                  onChange={(e) => setImpactSummary(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Action taken
                </label>
                <Textarea
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  What changed
                </label>
                <Textarea
                  value={changeOutcome}
                  onChange={(e) => setChangeOutcome(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-400">
                {error}
              </p>
            )}
            <Button type="button" onClick={handleUpdate}>
              Save update
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}

