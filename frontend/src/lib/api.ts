import { toast } from "sonner";

/**
 * API configuration for ReflectOS.
 *
 * The base URL comes from NEXT_PUBLIC_API_URL (set in .env.local).
 * Falls back to localhost for convenience, but production builds
 * should always define the env var explicitly.
 */
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export { API_URL };

/**
 * Helper to read the stored JWT token from localStorage.
 * Returns null if no token is found or the stored value is corrupted.
 */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("reflectos_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Check whether a JWT is expired by decoding the payload.
 * Returns true if the token is expired or cannot be parsed.
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds, Date.now() in ms
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Authenticated fetch wrapper.
 *
 * • Attaches the Bearer token from localStorage.
 * • Detects expired tokens and clears session automatically.
 * • Sets Content-Type to JSON unless the body is FormData.
 * • On a 401 response, clears the stored session so the user
 *   is redirected to login on the next render cycle.
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getStoredToken();

  // If the token exists but is expired, clear session immediately.
  if (token && isTokenExpired(token)) {
    localStorage.removeItem("reflectos_user");
    window.location.href = "/login";
    toast.error("Your session has expired. Please log in again.");
    return new Response(null, { status: 401, statusText: "Token expired" });
  }

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If the server rejects the token, clear session.
    if (response.status === 401) {
      localStorage.removeItem("reflectos_user");
      // Avoid redirect loops — only redirect if we are NOT already on /login
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
        toast.error("Your session is invalid. Please log in again.");
      }
      return response;
    }

    // Auto-toast for other 4xx/5xx errors
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const message = data?.message || "An unexpected error occurred.";
      toast.error(message);
    }

    return response;
  } catch (error) {
    // Network errors (e.g. server is down)
    toast.error("Cannot connect to server. Please check your connection.");
    throw error;
  }
}

