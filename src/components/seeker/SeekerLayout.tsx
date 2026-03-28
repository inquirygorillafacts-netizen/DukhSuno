'use client';

import React from "react";
import SeekerSidebar from "./SeekerSidebar";
import SeekerHeader from "./SeekerHeader";
import SeekerMobileNav from "./SeekerMobileNav";
import { IncomingCallBanner } from "@/components/call/IncomingCallBanner";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function SeekerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-jakarta" suppressHydrationWarning>
            {/* Desktop Sidebar */}
            <SeekerSidebar />

            <IncomingCallBanner />

            <div className="flex flex-col flex-1 min-w-0 h-full relative" suppressHydrationWarning>
                {/* Global Header */}
                <SeekerHeader />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-32 md:pb-10">
                    <div className="max-w-[1400px] mx-auto stagger-children" suppressHydrationWarning>
                        {children}
                    </div>
                </main>

                {/* Mobile Navigation */}
                <SeekerMobileNav />
            </div>
        </div>
        </AuthGuard>
    );
}
