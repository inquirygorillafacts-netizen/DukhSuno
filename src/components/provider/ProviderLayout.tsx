'use client';

import React from "react";
import ProviderSidebar from "./ProviderSidebar";
import ProviderHeader from "./ProviderHeader";
import ProviderMobileNav from "./ProviderMobileNav";
import { IncomingCallBanner } from "@/components/call/IncomingCallBanner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { syncPresence } from "@/lib/presence";
import { useEffect } from "react";

import { usePathname } from "next/navigation";

export default function ProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isEditMode = pathname?.includes('/profile/edit') || pathname?.includes('/profile/plans');

    useEffect(() => {
        syncPresence();
    }, []);

    return (
        <AuthGuard>
            <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-jakarta">
            {/* Desktop Sidebar */}
            {!isEditMode && <ProviderSidebar />}
            
            {/* Global Global Call Provider */}
            <IncomingCallBanner />

            <div className="flex flex-col flex-1 min-w-0 h-full relative">
                {/* Global Header */}
                {!isEditMode && <ProviderHeader />}

                {/* Main Content Area */}
                <main className={`flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 ${isEditMode ? 'pb-10' : 'pb-32 md:pb-10'}`}>
                    <div className="max-w-6xl mx-auto stagger-children">
                        {children}
                    </div>
                </main>

                {/* Mobile Navigation */}
                {!isEditMode && <ProviderMobileNav />}
            </div>
        </div>
        </AuthGuard>
    );
}
