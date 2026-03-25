'use client';

import React from "react";
import SpeakerSidebar from "./SpeakerSidebar";
import SpeakerHeader from "./SpeakerHeader";
import SpeakerMobileNav from "./SpeakerMobileNav";
import { IncomingCallBanner } from "@/components/call/IncomingCallBanner";

export default function SpeakerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-jakarta">
            {/* Desktop Sidebar */}
            <SpeakerSidebar />

            <IncomingCallBanner />

            <div className="flex flex-col flex-1 min-w-0 h-full relative">
                {/* Global Header */}
                <SpeakerHeader />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-32 md:pb-10">
                    <div className="max-w-6xl mx-auto stagger-children">
                        {children}
                    </div>
                </main>

                {/* Mobile Navigation */}
                <SpeakerMobileNav />
            </div>
        </div>
    );
}
