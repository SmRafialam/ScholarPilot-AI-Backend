"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ADMIN_ROLES, useAuth } from "@/lib/auth";

/* --------------------------------------------------------------- types */

interface Analytics {
  users: number;
  students: number;
  knowledgeBase: { universities: number; scholarships: number; professors: number };
  activity: { applications: number; documents: number; emails: number; matches: number };
  moderation: { pendingReview: number };
  ai: { calls: number; tokensIn: number; tokensOut: number; costCents: number };
}
interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  profile: { fullName: string | null; completionPercent: number } | null;
  subscription: { tier: string; status: string } | null;
}
interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/* --------------------------------------------------------------- page */

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const reqId = useRef(0);

  // Guard: only admins may view this console.
  useEffect(() => {
    if (!authLoading && (!user || !ADMIN_ROLES.includes(user.role))) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const loadAnalytics = useCallback(() => {
    api<Analytics>("/admin/analytics").then(setAnalytics).catch(() => {});
  }, []);

  const loadUsers = useCallback(async () => {
    const mine = ++reqId.current;
    const params = new URLSearchParams({ limit: "50" });
    if (debouncedQ) params.set("q", debouncedQ);
    try {
      const res = await api<Paged<AdminUserRow>>(`/admin/users?${params}`);
      if (mine === reqId.current) {
        setUsers(res.data);
        setTotal(res.total);
      }
    } catch {
      /* ignore */
    }
  }, [debouncedQ]);

  useEffect(() => {
    if (user && ADMIN_ROLES.includes(user.role)) {
      loadAnalytics();
      loadUsers();
    }
  }, [user, loadAnalytics, loadUsers]);

  async function mutate(id: string, path: string, body: object) {
    setBusyId(id);
    try {
      await api(`/admin/users/${id}/${path}`, { method: "PATCH", body: JSON.stringify(body) });
      await Promise.all([loadUsers(), loadAnalytics()]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        <span className="animate-spin-slow mr-2 inline-block h-4 w-4 rounded-full border-2 border-brand border-t-transparent" />
        Loading…
      </div>
    );
  }

  const stats = analytics
    ? [
        { label: "Total users", value: analytics.users, icon: "M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", tone: "brand" },
        { label: "Students", value: analytics.students, icon: "M12 3 1 9l11 6 9-4.9V17h2V9M5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8", tone: "brand-2" },
        { label: "Universities", value: analytics.knowledgeBase.universities, icon: "M12 3 1 9l11 6 9-4.9V17h2V9", tone: "accent" },
        { label: "Scholarships", value: analytics.knowledgeBase.scholarships, icon: "M12 2 3 7v6c0 5 3.8 8.5 9 9 5.2-.5 9-4 9-9V7Z", tone: "success" },
        { label: "Professors", value: analytics.knowledgeBase.professors, icon: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z", tone: "brand" },
        { label: "Applications", value: analytics.activity.applications, icon: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9", tone: "brand-2" },
        { label: "AI documents", value: analytics.activity.documents, icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6", tone: "accent" },
        { label: "AI calls", value: analytics.ai.calls, icon: "M13 2 3 14h7l-1 8 10-12h-7Z", tone: "success" },
      ]
    : [];

  return (
    <div className="flex min-h-screen">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="glass fixed inset-y-0 left-0 z-30 hidden w-64 flex-col p-5 lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-1">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-sm font-bold text-white shadow-lg">
            S
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">
              ScholarPilot <span className="gradient-text">AI</span>
            </div>
            <div className="text-[11px] text-muted">Admin Console</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-sm">
          <NavItem href="#overview" label="Overview" active icon="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z" />
          <NavItem href="#users" label="Users & Plans" icon="M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <a href="https://scholar-pilot-ai-flame.vercel.app" target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted transition-colors hover:bg-black/[0.04] hover:text-foreground">
            <Icon path="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" className="h-[18px] w-[18px]" />
            Live site
          </a>
        </nav>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-black/[0.03] p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-brand text-xs font-semibold text-white">
            {(user.email[0] ?? "A").toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-medium">{user.email}</div>
            <div className="text-[11px] text-muted">{user.role.replace("_", " ")}</div>
          </div>
        </div>
        <button onClick={logout} className="mt-2 rounded-xl border border-black/10 px-3 py-2 text-sm text-muted transition-colors hover:text-foreground">
          Log out
        </button>
      </aside>

      {/* ===================== MAIN ===================== */}
      <main className="flex-1 lg:ml-64">
        <header className="glass sticky top-0 z-20 flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-xs text-muted">Platform overview & user management</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadAnalytics(); loadUsers(); }} className="rounded-xl border border-black/10 px-3 py-2 text-sm text-muted transition-colors hover:text-foreground">
              ↻ Refresh
            </button>
            <button onClick={logout} className="btn-gradient rounded-xl px-4 py-2 text-sm font-medium text-white lg:hidden">
              Log out
            </button>
          </div>
        </header>

        <div id="overview" className="space-y-6 p-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(analytics ? stats : Array.from({ length: 8 })).map((s, i) =>
              analytics ? (
                <StatCard key={(s as { label: string }).label} {...(s as { label: string; value: number; icon: string; tone: string })} delay={i * 0.05} />
              ) : (
                <div key={i} className="skeleton h-28" />
              ),
            )}
          </div>

          {/* AI usage strip */}
          {analytics && (
            <div className="glass animate-fade-up grid gap-4 rounded-2xl p-5 sm:grid-cols-4">
              <Mini label="AI calls" value={analytics.ai.calls.toLocaleString()} />
              <Mini label="Tokens in" value={analytics.ai.tokensIn.toLocaleString()} />
              <Mini label="Tokens out" value={analytics.ai.tokensOut.toLocaleString()} />
              <Mini label="AI cost" value={`$${(analytics.ai.costCents / 100).toFixed(2)}`} />
            </div>
          )}

          {/* Users table */}
          <div id="users" className="glass overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">Users &amp; Plans</h2>
                <p className="text-xs text-muted">{total} account(s) · change a plan to test Free / Pro / Premium</p>
              </div>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by email…"
                  className="w-64 rounded-xl border border-black/10 bg-black/[0.04] py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-2/60"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const self = u.id === user.id;
                    const busy = busyId === u.id;
                    return (
                      <tr key={u.id} className="border-t border-black/[0.06] transition-colors hover:bg-black/[0.02]">
                        <td className="px-6 py-3">
                          <div className="font-medium">{u.profile?.fullName || "—"}</div>
                          <div className="text-xs text-muted">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            disabled={self || busy}
                            onChange={(e) => mutate(u.id, "role", { role: e.target.value })}
                            className="rounded-lg border border-black/10 bg-black/[0.04] px-2 py-1.5 text-xs outline-none focus:border-brand-2/60 disabled:opacity-50"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.subscription?.tier ?? "FREE"}
                            disabled={busy}
                            onChange={(e) => mutate(u.id, "plan", { tier: e.target.value })}
                            className={`rounded-lg border px-2 py-1.5 text-xs font-medium outline-none focus:border-brand-2/60 disabled:opacity-50 ${planClass(u.subscription?.tier ?? "FREE")}`}
                          >
                            <option value="FREE">Free</option>
                            <option value="PRO">Pro</option>
                            <option value="PREMIUM">Premium</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            disabled={self || busy}
                            onClick={() => mutate(u.id, "status", { isActive: !u.isActive })}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                              u.isActive ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                            }`}
                          >
                            {u.isActive ? "Active" : "Suspended"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/[0.06]">
                              <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${u.profile?.completionPercent ?? 0}%` }} />
                            </div>
                            <span className="text-xs text-muted">{u.profile?.completionPercent ?? 0}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-muted">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* --------------------------------------------------------------- bits */

const toneText: Record<string, string> = {
  brand: "text-brand",
  "brand-2": "text-brand-2",
  accent: "text-accent",
  success: "text-success",
};

function planClass(tier: string): string {
  if (tier === "PREMIUM") return "border-brand-2/40 bg-brand-2/10 text-brand-2";
  if (tier === "PRO") return "border-brand/40 bg-brand/10 text-brand";
  return "border-black/10 bg-black/[0.04] text-muted";
}

function StatCard({ label, value, icon, tone, delay }: { label: string; value: number; icon: string; tone: string; delay: number }) {
  return (
    <div className="card-hover glass animate-fade-up rounded-2xl p-5" style={{ animationDelay: `${delay}s` }}>
      <span className={`grid h-10 w-10 place-items-center rounded-xl bg-black/[0.04] ${toneText[tone] ?? "text-brand"}`}>
        <Icon path={icon} className="h-5 w-5" />
      </span>
      <div className="mt-4 text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 text-lg font-semibold">{value}</div>
    </div>
  );
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: string; active?: boolean }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        active
          ? "bg-gradient-to-r from-brand/20 to-brand-2/10 font-medium text-foreground"
          : "text-muted hover:bg-black/[0.04] hover:text-foreground"
      }`}
    >
      <Icon path={icon} className="h-[18px] w-[18px]" />
      {label}
    </a>
  );
}

function Icon({ path, className = "" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}
