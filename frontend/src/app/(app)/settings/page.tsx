"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Monitor, Bell, LogOut, Check } from "lucide-react";
import { motion } from "framer-motion";
import { TRANSITION } from "@/lib/motion";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // State for form
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved");
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both pb-12">
      
      <header className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account and preferences</p>
      </header>

      <div className="space-y-10">
        
        {/* Account Settings */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-text-primary mb-4 border-b border-border-subtle pb-2">
            <User size={18} />
            <h2 className="text-sm font-semibold">Account</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-border-default px-0 py-2 text-text-primary focus:ring-0 focus:border-accent transition-colors outline-none" 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-border-default px-0 py-2 text-text-primary focus:ring-0 focus:border-accent transition-colors outline-none" 
              />
            </div>
          </div>
        </section>

        {/* Display Settings */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-text-primary mb-4 border-b border-border-subtle pb-2">
            <Monitor size={18} />
            <h2 className="text-sm font-semibold">Display</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Theme Preference</label>
              <div className="flex bg-bg-surface-raised border border-border-subtle rounded-lg p-1 w-fit">
                {["light", "dark", "system"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`relative px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                      theme === t 
                        ? "text-text-primary" 
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {theme === t && (
                      <motion.div
                        layoutId="theme-active"
                        className="absolute inset-0 bg-bg-base border border-border-default rounded-md shadow-sm"
                        transition={TRANSITION}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <span className="relative z-10">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-text-primary mb-4 border-b border-border-subtle pb-2">
            <Bell size={18} />
            <h2 className="text-sm font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border border-border-default rounded bg-bg-surface group-hover:border-accent transition-colors">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <Check size={12} className="text-accent opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
              <span className="text-sm text-text-primary">Daily reflection reminder</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border border-border-default rounded bg-bg-surface group-hover:border-accent transition-colors">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <Check size={12} className="text-accent opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
              <span className="text-sm text-text-primary">Weekly summary email</span>
            </label>
          </div>
        </section>

        {/* Save / Danger */}
        <div className="pt-6 mt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="destructive" onClick={logout} className="w-full sm:w-auto order-2 sm:order-1">
            <LogOut size={16} className="mr-2" /> Sign out
          </Button>
          
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto order-1 sm:order-2 px-8">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>

      </div>
    </div>
  );
}
