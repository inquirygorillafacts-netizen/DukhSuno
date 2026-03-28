import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BigSuno — Dil ki baat sune koi apna ✨",
  description:
    "BigSuno: Anonymous consultation, mentorship, and influencer platform. Connect with experts for career, guidance, and emotional support.",
  keywords: ["emotional support", "anonymous", "voice call", "therapy", "India"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BigSuno",
  },
};

export const viewport = {
  themeColor: "#FFFFFF",
};

import { PresenceProvider } from "@/components/PresenceProvider";
import { MainLayout } from "@/components/MainLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="light" suppressHydrationWarning>
      <body className="antialiased selection:bg-rose-100 selection:text-rose-900" suppressHydrationWarning>
        <AuthGuard>
          <PresenceProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </PresenceProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
