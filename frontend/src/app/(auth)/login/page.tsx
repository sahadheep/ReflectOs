"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  "Clarity comes from engagement, not thought.",
  "What gets measured gets managed.",
  "Focus is not saying yes to all important things, rather it is saying no to less important things.",
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to login");

      login({
        id: data.id,
        username: data.username,
        email: data.email,
        token: data.token,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-base">
      {/* Branding Panel (45% left, hidden on mobile) */}
      <div className="hidden md:flex w-[45%] bg-[#0B0D10] relative overflow-hidden p-12 flex-col justify-between border-r border-border-subtle">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-60"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-accent text-bg-base flex items-center justify-center font-bold text-xl leading-none">
            R
          </div>
          <span className="font-semibold text-text-primary text-xl tracking-tight">
            ReflectOS
          </span>
        </div>

        <div className="relative z-10 max-w-sm">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-serif text-text-primary leading-tight"
            >
              "{quotes[quoteIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Form Panel (55% right, full width on mobile) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-surface-raised">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-text-primary tracking-tight">Welcome back</h1>
            <p className="text-text-secondary text-sm">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              {/* Input Group: Bottom Border Only */}
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-transparent border-0 border-b border-border-default px-0 py-3 text-text-primary placeholder:text-text-tertiary focus:ring-0 focus:border-accent transition-colors outline-none"
                />
              </div>
              
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent border-0 border-b border-border-default px-0 py-3 text-text-primary placeholder:text-text-tertiary focus:ring-0 focus:border-accent transition-colors outline-none"
                />
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-danger flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-bg-base py-3 rounded-md font-medium hover:bg-accent-hover transition-colors focus-visible:shadow-focus disabled:opacity-70 flex justify-center"
            >
              {isLoading ? <span className="w-5 h-5 border-2 border-bg-base border-t-transparent rounded-full animate-spin"></span> : "Sign in"}
            </button>
          </form>

          <div className="text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link href="/register" className="text-accent hover:text-accent-hover font-medium">
              Create one
            </Link>
          </div>

          {/* Optional Dev Mode trigger if enabled */}
          {process.env.NODE_ENV === "development" && (
            <div className="pt-6 mt-6 border-t border-border-subtle text-center">
              <button 
                type="button" 
                className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
                onClick={() => { setUsername("johndoe"); setPassword("password"); }}
              >
                Fill demo credentials
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
