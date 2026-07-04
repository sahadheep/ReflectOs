"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  "Small daily improvements are the key to staggering long-term results.",
  "Your habits will determine your future.",
  "A year from now you will wish you had started today.",
];

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  const { login } = useAuth(); // Log them in right after registering if the API returns a token
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        // If the backend returns a structured error or just a message
        throw new Error(data.message || "Registration failed");
      }

      // Automatically log in using the newly created credentials
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const loginData = await loginRes.json();
      
      if (loginRes.ok && loginData.accessToken) {
        login({
          id: loginData.id,
          username: loginData.username,
          email: loginData.email,
          token: loginData.accessToken,
        });
      } else {
        // Fallback: send them to login page
        router.push("/login?registered=true");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-base text-text-primary">
      
      {/* Form Panel (55% left, full width on mobile) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-surface-raised order-2 md:order-1">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-text-secondary text-sm">Start tracking your habits and reflecting today</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
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
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-0 border-b border-border-default px-0 py-3 text-text-primary placeholder:text-text-tertiary focus:ring-0 focus:border-accent transition-colors outline-none"
                />
              </div>
              
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
              {isLoading ? <span className="w-5 h-5 border-2 border-bg-base border-t-transparent rounded-full animate-spin"></span> : "Sign up"}
            </button>
          </form>

          <div className="text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Branding Panel (45% right, hidden on mobile) */}
      <div className="hidden md:flex w-[45%] bg-[#0B0D10] relative overflow-hidden p-12 flex-col justify-between border-l border-border-subtle order-1 md:order-2">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-60"></div>
        
        <div className="relative z-10 flex items-center gap-3 self-end">
          <span className="font-semibold text-text-primary text-xl tracking-tight">
            ReflectOS
          </span>
          <div className="w-10 h-10 rounded-md bg-accent text-bg-base flex items-center justify-center font-bold text-xl leading-none">
            R
          </div>
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

    </div>
  );
}
