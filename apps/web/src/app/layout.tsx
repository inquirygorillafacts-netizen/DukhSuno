import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DukhSuno — Dil ki baat sune koi apna",
  description:
    "Anonymous emotional support marketplace. Sunane wale pay karke sune. Sunne wale earn karke sune. WebRTC P2P call. Premium UI.",
  keywords: ["emotional support", "anonymous", "voice call", "therapy", "India"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
  },
};

import { PresenceProvider } from "@/components/PresenceProvider";
import { MainLayout } from "@/components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="light">
      <body className="antialiased selection:bg-rose-100 selection:text-rose-900">
        <PresenceProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </PresenceProvider>
      </body>
    </html>
  );
}
