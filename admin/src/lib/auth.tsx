"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, tokens } from "./api";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokens.access) {
      setLoading(false);
      return;
    }
    api<AdminUser>("/auth/me")
      .then(setUser)
      .catch(() => tokens.clear())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await api<{ user: AdminUser; accessToken: string; refreshToken: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    );
    if (!ADMIN_ROLES.includes(data.user.role)) {
      throw new Error("This account is not an administrator.");
    }
    tokens.set(data.accessToken, data.refreshToken);
    setUser(data.user);
  }

  function logout() {
    const refreshToken = tokens.refresh;
    if (refreshToken) {
      api("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        retry: false,
      }).catch(() => {});
    }
    tokens.clear();
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
