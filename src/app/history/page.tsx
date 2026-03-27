'use client';

import React, { useState } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Calendar, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming'>('outgoing');

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="max-w-xl mx-auto px-4 pt-8 space-y-10 animate-in fade-in duration-500">
        {/* 1. Header (Admin Style) */}
        <div className="flex items-center justify-between mb-2">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Session Logs</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit your conversation history</p>
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-300">
                <History size={20} />
            </div>
        </div>

        {/* 2. Professional Tab Switcher (Admin Filter Style) */}
        <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm w-full">
            <button 
                onClick={() => setActiveTab('outgoing')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'outgoing' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900'}`}
            >
                Outgoing
            </button>
            <button 
                onClick={() => setActiveTab('incoming')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'incoming' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900'}`}
            >
                Incoming
            </button>
        </div>

        {/* 3. History List (Admin Table Row Style) */}
        <section className="space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 flex items-center gap-6 hover:bg-slate-50/50 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                    activeTab === 'outgoing' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                }`}>
                  {activeTab === 'outgoing' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-black tracking-tight truncate text-slate-900 uppercase">
                      {activeTab === 'outgoing' ? 'Rajesh Kumar' : 'User #1293'}
                    </h4>
                    <span className="text-sm font-black tracking-tighter text-slate-900">₹500.00</span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={12} className="opacity-50" />
                      <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">24 Mar 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={12} className="opacity-50" />
                      <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">15:00 Mins</span>
                    </div>
                  </div>
                </div>

                <button className="h-10 px-5 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-inner border border-slate-100">
                  Verify
                </button>
              </div>
            ))}
          </div>

          {/* 4. Digital Audit Footer */}
          <div className="py-20 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                <History size={32} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">End of archived logs</p>
             <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Logs are immutable in production</p>
          </div>
        </section>
      </div>
    </div>
  );
}
