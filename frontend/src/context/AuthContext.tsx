"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────
interface User {
  id: number;
  username: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

// ─── Constants ────────────────────────────────────────────────────
const STORAGE_KEY = "reflectos_user";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

/**
 * Dev-mode auth is allowed ONLY when:
 *  1. The env flag is explicitly "true", AND
 *  2. We are NOT in a production build.
 *
 * This double-gate ensures that even if someone accidentally
 * ships with the flag set, production builds will never execute
 * the dev-login path.
 */
const isDevAuthEnabled =
  process.env.NEXT_PUBLIC_DEV_MODE_AUTH === "true" &&
  process.env.NODE_ENV !== "production";

// ─── Context ──────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Boot: restore session or perform dev-login
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        // Basic sanity check — if the token is missing, discard.
        if (parsed?.token) {
          setUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
      return;
    }

    // No stored session — try dev-login if enabled
    if (isDevAuthEnabled) {
      fetch(`${API_URL}/auth/dev-login`, { method: "POST" })
        .then((res) => {
          if (!res.ok) throw new Error(`Dev login returned ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data?.token) {
            const u: User = {
              id: data.id,
              username: data.username,
              email: data.email,
              token: data.token,
            };
            setUser(u);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          }
        })
        .catch((e) => console.error("Dev login failed:", e))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    (userData: User) => {
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
