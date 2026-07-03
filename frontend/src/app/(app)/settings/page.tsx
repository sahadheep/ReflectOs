"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Monitor,
  Moon,
  Sun,
  Mail,
  Bell,
  Download,
  FileText,
  LogOut,
  Settings,
  Palette,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`Exported data as ${format.toUpperCase()}`);
    }, 1500);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const sections = [
    {
      icon: Palette,
      title: "Appearance",
      description: "Customize how ReflectOS looks on your device",
      color: "text-blue-500",
      children: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
            <div>
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground mt-1">
                Light, dark, or system preference
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border/50">
              {[
                { id: "light", icon: Sun, label: "Light" },
                { id: "dark", icon: Moon, label: "Dark" },
                { id: "system", icon: Monitor, label: "System" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                    theme === id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Control how you receive notifications and alerts",
      color: "text-warning",
      children: (
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              title: "Email Notifications",
              description: "Receive emails for task assignments and reminders",
            },
            {
              icon: Bell,
              title: "In-App Notifications",
              description: "Show toast notifications for updates",
            },
          ].map((notif, idx) => {
            const Icon = notif.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-lg border border-border/50">
                    <Icon size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{notif.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {notif.description}
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            );
          })}
        </div>
      ),
    },
    {
      icon: Download,
      title: "Export Data",
      description: "Download your tasks, diary entries, and statistics",
      color: "text-success",
      children: (
        <div className="flex flex-wrap gap-3">
          {[
            { format: "CSV", icon: "📊" },
            { format: "PDF", icon: "📄" },
            { format: "JSON", icon: "{ }" },
          ].map((option) => (
            <motion.button
              key={option.format}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport(option.format)}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-all disabled:opacity-50"
            >
              <span>{option.icon}</span>
              <span className="text-sm font-medium">
                Export as {option.format}
              </span>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      icon: Lock,
      title: "Security",
      description: "Manage your account security and privacy",
      color: "text-danger",
      children: (
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <p className="font-medium text-foreground mb-2">Password</p>
            <p className="text-sm text-muted-foreground mb-4">
              Change your password regularly to keep your account secure
            </p>
            <Button variant="outline">Change Password</Button>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <p className="font-medium text-foreground mb-2">Sessions</p>
            <p className="text-sm text-muted-foreground mb-4">
              Sign out of all other sessions
            </p>
            <Button variant="outline">Sign Out All Sessions</Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 space-y-8 max-w-4xl"
    >
      {/* Header */}
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <Settings size={32} /> Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Settings sections */}
      <div className="grid gap-6">
        {sections.map((section, idx) => {
          const SectionIcon = section.icon;
          return (
            <motion.div key={idx} variants={item}>
              <Card className="card-elevated border-border/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <SectionIcon size={20} className={section.color} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>{section.children}</CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Danger zone */}
      <motion.div variants={item}>
        <Card className="card-elevated border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that cannot be undone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to log out? You'll need to log in again.",
                  )
                ) {
                  logout();
                  toast.success("Logged out successfully");
                }
              }}
            >
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
            <Button
              variant="outline"
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              disabled
            >
              Delete Account (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
