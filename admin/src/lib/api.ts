/**
 * Typed API client for the ScholarPilot admin console.
 * Attaches the JWT access token and transparently refreshes on 401 once.
 */
const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://scholarpilot-ai-backend.onrender.com/api/v1";

const ACCESS = "spa_access";
const REFRESH = "spa_refresh";

export const tokens = {
  get access() {
    return typeof window !== "undefined" ? localStorage.getItem(ACCESS) : null;
  },
  get refresh() {
    return typeof window !== "undefined" ? localStorage.getItem(REFRESH) : null;
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

async function refreshTokens(): Promise<boolean> {
  const refresh = tokens.refresh;
  if (!refresh) return false;
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  tokens.set(data.accessToken, data.refreshToken);
  return true;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { retry?: boolean } = {},
): Promise<T> {
  const { retry = true, ...init } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(tokens.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401 && retry) {
    if (await refreshTokens()) {
      return api<T>(path, { ...options, retry: false });
    }
    tokens.clear();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
