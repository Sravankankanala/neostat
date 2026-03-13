'use client';

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("neoconnect_token");
}

export default function NewMinutesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userRaw =
      typeof window !== "undefined"
        ? localStorage.getItem("neoconnect_user")
        : null;
    if (!userRaw) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userRaw);
    if (user.role !== "SECRETARIAT" && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const formData = new FormData(e.currentTarget);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/minutes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Unable to upload minutes");
      }
      router.push("/hub/minutes");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Upload meeting minutes
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Share approved minutes so staff can see key decisions.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Title
            </label>
            <Input name="title" required className="mt-1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Department (optional)
            </label>
            <Input name="department" className="mt-1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Meeting date
            </label>
            <Input
              name="meetingDate"
              type="date"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              PDF file
            </label>
            <input
              type="file"
              name="file"
              required
              accept=".pdf"
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
              {loading ? "Uploading…" : "Upload"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

