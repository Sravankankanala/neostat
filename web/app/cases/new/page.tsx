'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("neoconnect_token");
}

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const formData = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/cases`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Unable to submit case");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          New feedback / complaint
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Your submission will be routed to the Secretariat and assigned to a Case Manager.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300">
                Title
              </label>
              <Input name="title" required className="mt-1" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Category
              </label>
              <select
                name="category"
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              >
                <option value="Safety">Safety</option>
                <option value="Policy">Policy</option>
                <option value="Facilities">Facilities</option>
                <option value="HR">HR</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Department
              </label>
              <Input name="department" required className="mt-1" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Location
              </label>
              <Input name="location" required className="mt-1" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Severity
              </label>
              <select
                name="severity"
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Details
            </label>
            <Textarea name="description" required rows={5} className="mt-1" />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="anonymous"
              type="checkbox"
              name="anonymous"
              value="true"
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500"
            />
            <label htmlFor="anonymous" className="text-xs text-slate-300">
              Submit anonymously (your name will not be shown to the Case Manager)
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Attachments (photo or PDF)
            </label>
            <input
              type="file"
              name="files"
              multiple
              accept=".png,.jpg,.jpeg,.pdf"
              className="mt-1 block w-full text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-50 hover:file:bg-slate-700"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Submit case"}
            </Button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-xs text-slate-300 hover:text-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

