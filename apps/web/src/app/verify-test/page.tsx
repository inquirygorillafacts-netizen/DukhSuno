'use client';

import { useState, useEffect } from 'react';
import { Phone, CheckCircle2, Info, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyTestPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure number starts with +91 if not provided
      const fullNumber = phone.startsWith('+') ? phone : `+91${phone}`;
      
      const response = await fetch('/api/twilio/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullNumber }),
      });
      
      const data = await response.json();
      
      if (data.validationCode) {
        setCode(data.validationCode);
        startPolling(fullNumber);
      } else {
        setError(data.error || 'Failed to get validation code');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (fullNumber: string) => {
    const interval = setInterval(async () => {
      try {
        const resp = await fetch(`/api/twilio/verify?phoneNumber=${encodeURIComponent(fullNumber)}`);
        const data = await resp.json();
        if (data.isVerified) {
          setIsVerified(true);
          setCode(null); // Clear code as it's no longer needed
          clearInterval(interval);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 4000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (!isVerified) {
        setError('Verification timed out. Please try again.');
      }
    }, 120000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-soft"></div>

      <div className="w-full max-w-[480px] glass-container rounded-[42px] p-8 md:p-10 relative z-10 stagger-children border border-white/20 shadow-2xl">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-[12px] font-black uppercase tracking-widest mb-8">
           <ShieldCheck size={16} fill="currentColor" strokeWidth={0} />
           System Health Check
        </div>

        <div className="space-y-4 mb-10">
          <h1 className="text-[38px] font-black text-gradient leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Twilio Onboarding <br/>Verification Test ✨
          </h1>
          <p className="text-text-secondary text-[16px] font-medium leading-relaxed">
            Apna number verify karke system ko test karein. Hamara Cloudflare Tunnel aur Twilio API test ke liye ready hai.
          </p>
        </div>

        <div className="space-y-8">
          {!isVerified ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[12px] font-black text-text-secondary/60 px-4 uppercase tracking-[0.2em]">Phone Number</label>
                <div className="flex gap-3">
                    <div className="w-20 h-16 rounded-[22px] bg-white/40 flex items-center justify-center font-black text-accent shadow-sm border border-white/40 backdrop-blur-md">
                        🇮🇳
                    </div>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="00000 00000"
                        className="flex-1 h-16 px-6 rounded-[22px] bg-white/60 text-[22px] font-black outline-none focus:ring-4 focus:ring-accent/10 transition-all shadow-sm border border-white/40 placeholder:text-text-secondary/20"
                    />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[14px] font-medium flex gap-3 items-center animate-shake">
                  <Info size={18} />
                  {error}
                </div>
              )}

              <Button 
                onClick={startVerification}
                disabled={phone.length < 10 || loading}
                className="w-full h-18 text-[18px] font-bold rounded-full btn-primary group shadow-2xl shadow-accent/20"
              >
                {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                ) : (
                    <span className="flex items-center gap-2">
                        Verify My Number <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                )}
              </Button>

              {code && (
                <div className="mt-8 p-8 rounded-[32px] bg-accent/5 border-2 border-dashed border-accent/20 text-center animate-scale-up space-y-4">
                  <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-accent/20 mb-2">
                    <Phone size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-accent">Aapko ek call aayegi!</h3>
                  <p className="text-text-secondary font-medium px-4">Kripya phone keypad par ye code type karein:</p>
                  <div className="text-[52px] font-black text-gradient tracking-[14px] py-4">{code}</div>
                  <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2">
                           <div className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                           <div className="w-2 h-2 rounded-full bg-accent animate-bounce animation-delay-[200ms]" />
                           <div className="w-2 h-2 rounded-full bg-accent animate-bounce animation-delay-[400ms]" />
                        </div>
                        <p className="text-[12px] text-accent font-black uppercase tracking-[0.3em]">Detecting call...</p>
                     </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 animate-scale-up space-y-8 bg-green-50/50 rounded-[42px] border border-green-100">
               <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40">
                  <CheckCircle2 size={48} />
               </div>
               <div className="space-y-2">
                    <h3 className="text-[32px] font-black text-green-600 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Verified! 🎉</h3>
                    <p className="text-text-secondary font-medium max-w-[280px] mx-auto">Aapka number ab Twilio par whitelist ho gaya hai. Ab aap calls test kar sakte hain.</p>
               </div>
               <Button 
                onClick={() => { setIsVerified(false); setPhone(''); setCode(null); }}
                variant="outline"
                className="rounded-full h-12 px-8 border-green-200 text-green-600 hover:bg-green-50"
               >
                 Test Another Number
               </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
