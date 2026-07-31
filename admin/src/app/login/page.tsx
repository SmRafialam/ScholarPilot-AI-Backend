"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="glow animate-pulse-glow left-[15%] top-[20%] h-[360px] w-[420px] bg-brand/30" />
      <div className="glow animate-pulse-glow right-[12%] bottom-[15%] h-[320px] w-[380px] bg-brand-2/25" />

      <div className="glass animate-fade-up relative z-10 w-full max-w-md rounded-3xl p-8">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-lg font-bold text-white shadow-lg">
            S
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">
              ScholarPilot <span className="gradient-text">AI</span>
            </div>
            <div className="text-xs text-muted">Admin Console</div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold">Welcome back, admin</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage the platform.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="admin@scholarpilot.ai" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error && (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full rounded-xl py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Restricted area — administrator accounts only.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-2/60"
      />
    </label>
  );
}
