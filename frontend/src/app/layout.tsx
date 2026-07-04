import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReflectOS | Focus & Productivity",
  description: "A premium personal productivity and focus application designed to build habits, track tasks, and reflect on your daily growth.",
  keywords: ["productivity", "focus", "habits", "tasks", "diary", "reflectos"],
  authors: [{ name: "ReflectOS Team" }],
  openGraph: {
    title: "ReflectOS",
    description: "Build habits, track tasks, and reflect on your daily growth.",
    url: "https://reflectos.app",
    siteName: "ReflectOS",
    images: [
      {
        url: "https://reflectos.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReflectOS Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

import { ReactQueryProvider } from "@/components/ReactQueryProvider";

import { TimerProvider } from "@/context/TimerContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sourceSerif.variable} antialiased bg-bg-base text-text-primary selection:bg-accent/20`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AuthProvider>
              <TimerProvider>
                {children}
                <Toaster />
              </TimerProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
