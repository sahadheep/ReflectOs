import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
