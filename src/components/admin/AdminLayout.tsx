'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import { IncomingCallBanner } from "@/components/call/IncomingCallBanner";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, hasRole, isLoading } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && (!user || !hasRole('admin'))) {
            router.push('/');
        }
    }, [mounted, user, hasRole, isLoading, router]);

    // On server (or first client render), always show the fallback to match server output
    if (!mounted) {
        return (
            <div
                className="h-screen bg-slate-50 flex items-center justify-center font-black uppercase text-slate-400 tracking-[0.5em] animate-pulse"
                suppressHydrationWarning
            >
                ADMIN...
            </div>
        );
    }

    return (
        <AuthGuard>
            {(!user || !hasRole('admin')) ? (
                <div className="h-screen bg-slate-50 flex items-center justify-center font-black uppercase text-slate-400 tracking-[0.5em] animate-pulse">
                    Verifying Access...
                </div>
            ) : (
                <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-jakarta">
                    <AdminSidebar />
                    <IncomingCallBanner />
                    <div className="flex flex-col flex-1 min-w-0 h-full relative">
                        <AdminHeader />
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-32 md:pb-10">
                            <div className="max-w-6xl mx-auto stagger-children">
                                {children}
                            </div>
                        </main>
                        <AdminMobileNav />
                    </div>
                </div>
            )}
        </AuthGuard>
    );
}
