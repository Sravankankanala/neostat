'use client';

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("neoconnect_token");
}

export default function NewPollPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  function updateOption(idx: number, value: string) {
    setOptions((prev) =>
      prev.map((opt, i) => (i === idx ? value : opt))
    );
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
      if (cleanOptions.length < 2) {
        throw new Error("Please provide at least two options.");
      }
      const res = await fetch(`${API_URL}/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, options: cleanOptions }),
      });
      if (!res.ok) {
        throw new Error("Unable to create poll");
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
      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          New poll
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Create a quick pulse poll for staff.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Question
            </label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Options
            </label>
            {options.map((opt, idx) => (
              <Input
                key={idx}
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="mt-1"
              />
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addOption}
            >
              + Add option
            </Button>
          </div>
          {error && (
            <p className="text-xs text-red-400">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create poll"}
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

