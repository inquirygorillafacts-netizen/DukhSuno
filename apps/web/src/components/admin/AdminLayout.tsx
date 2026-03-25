'use client';

import React from "react";
import OwnerSidebar from "@/components/admin/OwnerSidebar";
import OwnerHeader from "@/components/admin/OwnerHeader";
import OwnerMobileNav from "@/components/admin/OwnerMobileNav";

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-jakarta">
            {/* Desktop Sidebar */}
            <OwnerSidebar />

            <div className="flex flex-col flex-1 min-w-0 h-full relative">
                {/* Global Header */}
                <OwnerHeader />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-32 md:pb-10">
                    <div className="max-w-7xl mx-auto stagger-children">
                        {children}
                    </div>
                </main>

                {/* Mobile Navigation */}
                <OwnerMobileNav />
            </div>
        </div>
    );
}
