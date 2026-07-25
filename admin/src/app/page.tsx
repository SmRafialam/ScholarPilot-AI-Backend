/* ------------------------------------------------------------------ data */

const NAV = [
  { label: "Dashboard", icon: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z", active: true },
  { label: "Universities", icon: "M12 3 1 9l11 6 9-4.9V17h2V9M5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8" },
  { label: "Scholarships", icon: "M12 2 3 7v6c0 5 3.8 8.5 9 9 5.2-.5 9-4 9-9V7Z" },
  { label: "Professors", icon: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-4 6c-4 0-8 2-8 5h16c0-3-4-5-8-5Z" },
  { label: "Students", icon: "M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" },
  { label: "Review Queue", icon: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" },
  { label: "Analytics", icon: "M4 20V10m6 10V4m6 16v-7m4 7H2" },
  { label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.5-2.4 1a7.3 7.3 0 0 0-2.2-1.3l-.4-2.6H9.7l-.4 2.6a7.3 7.3 0 0 0-2.2 1.3l-2.4-1-2 3.5 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.5 2.4-1a7.3 7.3 0 0 0 2.2 1.3l.4 2.6h4.6l.4-2.6a7.3 7.3 0 0 0 2.2-1.3l2.4 1 2-3.5-2-1.6c.1-.4.1-.8.1-1.3Z" },
];

const STATS = [
  { label: "Universities", value: "1,284", delta: "+42", tone: "brand", icon: "M12 3 1 9l11 6 9-4.9V17h2V9" },
  { label: "Scholarships", value: "3,619", delta: "+128", tone: "accent", icon: "M12 2 3 7v6c0 5 3.8 8.5 9 9 5.2-.5 9-4 9-9V7Z" },
  { label: "Professors", value: "8,942", delta: "+310", tone: "brand-2", icon: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" },
  { label: "Active students", value: "512", delta: "+37", tone: "success", icon: "M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
];

const SCRAPE = [
  { day: "Mon", v: 62 },
  { day: "Tue", v: 78 },
  { day: "Wed", v: 45 },
  { day: "Thu", v: 90 },
  { day: "Fri", v: 71 },
  { day: "Sat", v: 55 },
  { day: "Sun", v: 83 },
];

const QUEUE = [
  { name: "Technical University of Munich", type: "University", country: "Germany", status: "Pending" },
  { name: "DAAD EPOS Scholarship", type: "Scholarship", country: "Germany", status: "Pending" },
  { name: "Prof. Anna Lindqvist", type: "Professor", country: "Sweden", status: "Review" },
  { name: "University of Toronto", type: "University", country: "Canada", status: "Approved" },
  { name: "Erasmus Mundus JMD", type: "Scholarship", country: "Netherlands", status: "Pending" },
  { name: "Prof. Marco Rossi", type: "Professor", country: "Italy", status: "Review" },
];

/* -------------------------------------------------------------- helpers */

function Icon({ path, className = "" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

const toneText: Record<string, string> = {
  brand: "text-brand",
  "brand-2": "text-brand-2",
  accent: "text-accent",
  success: "text-success",
};

const statusStyle: Record<string, string> = {
  Pending: "bg-warning/15 text-warning",
  Review: "bg-accent/15 text-accent",
  Approved: "bg-success/15 text-success",
};

const typeStyle: Record<string, string> = {
  University: "bg-brand/15 text-brand",
  Scholarship: "bg-accent/15 text-accent",
  Professor: "bg-brand-2/15 text-brand-2",
};

/* ------------------------------------------------------------------ page */

export default function AdminDashboard() {
  const maxV = Math.max(...SCRAPE.map((s) => s.v));

  return (
    <div className="flex min-h-screen">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/5 bg-surface/60 p-5 backdrop-blur lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-1">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-sm font-bold text-white shadow-lg">
            S
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">
              ScholarPilot <span className="gradient-text">AI</span>
            </div>
            <div className="text-[11px] text-muted">Admin Console</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                item.active
                  ? "bg-gradient-to-r from-brand/20 to-brand-2/10 font-medium text-foreground"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon path={item.icon} className="h-[18px] w-[18px]" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-brand text-xs font-semibold text-white">
            SR
          </span>
          <div className="leading-tight">
            <div className="text-sm font-medium">S. M. Rafi</div>
            <div className="text-[11px] text-muted">Super Admin</div>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN ===================== */}
      <main className="flex-1 lg:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-background/70 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-xs text-muted">Knowledge base & platform overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted sm:flex">
              <Icon path="M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" className="h-4 w-4" />
              <span>Search…</span>
            </div>
            <button className="rounded-xl bg-gradient-to-r from-brand to-brand-2 px-4 py-2 text-sm font-medium text-white shadow-lg">
              + New entry
            </button>
          </div>
        </header>

        <div className="space-y-6 p-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="card-hover glass animate-fade-up rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl bg-white/5 ${toneText[s.tone]}`}>
                    <Icon path={s.icon} className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    {s.delta}
                  </span>
                </div>
                <div className="mt-4 text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Scraping activity chart */}
            <div className="glass rounded-2xl p-6 lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Scraping activity</h2>
                  <p className="text-xs text-muted">New records ingested this week</p>
                </div>
                <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">This week</span>
              </div>
              <div className="flex h-48 items-end justify-between gap-3">
                {SCRAPE.map((s) => (
                  <div key={s.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-brand to-brand-2 transition-all"
                        style={{ height: `${(s.v / maxV) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted">{s.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data health */}
            <div className="glass rounded-2xl p-6">
              <h2 className="mb-6 text-base font-semibold">Data health</h2>
              <div className="space-y-5">
                <HealthBar label="Verified" pct={95} tone="from-success to-accent" />
                <HealthBar label="Pending review" pct={4} tone="from-warning to-brand-2" />
                <HealthBar label="Stale / flagged" pct={1} tone="from-danger to-brand-2" />
              </div>
              <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="text-xs text-muted">Overall knowledge-base validity</div>
                <div className="mt-1 gradient-text text-3xl font-bold">95%</div>
              </div>
            </div>
          </div>

          {/* Review queue table */}
          <div className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">Review queue</h2>
                <p className="text-xs text-muted">Newly scraped entries awaiting approval</p>
              </div>
              <a href="#" className="text-sm text-brand hover:underline">View all</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Country</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {QUEUE.map((row) => (
                    <tr key={row.name} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-medium">{row.name}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${typeStyle[row.type]}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted">{row.country}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* --------------------------------------------------------- health bar */

function HealthBar({ label, pct, tone }: { label: string; pct: number; tone: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
