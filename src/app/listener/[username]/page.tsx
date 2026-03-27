'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { SPECIALTY_LABELS } from '@/types';
import type { DukhSunoUser, Plan } from '@/types';
import { Phone, Star, ChevronDown, Share2 } from 'lucide-react';

// Demo listener data (until Firebase is connected)
const DEMO_LISTENER: Partial<DukhSunoUser> = {
  uid: 'demo-1',
  displayName: 'Meera Ji',
  avatarUrl: 'avatar:👩‍💼',
  bannerUrl: '',
  headline: 'Aapka dost hu, sab sunta hu 💙',
  bio: 'Main samajhti hu ki zindagi mushkil ho sakti hai. Pichle 3 saal se logon ki madad kar rahi hu unke dukh sunke. Mujhe batao aap kya mehsoos kar rahe hain — main bina judge kiye sunuungi. Aap akele nahi hain. 💙',
  specialties: ['relationship', 'loneliness', 'grief', 'family'],
  gender: 'female',
  age: 28,
  plans: [
    { id: 'p1', heading: 'Chhoti si baat', minutes: 5, price: 50, description: 'Quick 5 min talk', bannerUrl: null },
    { id: 'p2', heading: 'Dil kholke baat', minutes: 15, price: 120, description: 'Aram se baat karo', bannerUrl: null },
    { id: 'p3', heading: 'Full session', minutes: 30, price: 200, description: 'Puri baat, bina rush ke', bannerUrl: null },
  ],
  ratingAvg: 4.8,
  ratingCount: 142,
  totalSessions: 200,
  isAvailable: true,
  isVerified: true,
  username: 'meera-ji',
};

export default function ListenerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [listener, setListener] = useState<Partial<DukhSunoUser>>(DEMO_LISTENER);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [loading, setLoading] = useState(false);

  // Try to fetch from Firestore
  useEffect(() => {
    async function fetchListener() {
      try {
        const q = query(
          collection(db, 'users'),
          where('username', '==', params.username),
          where('isVerified', '==', true),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setListener(snap.docs[0].data() as DukhSunoUser);
        }
      } catch {
        // Use demo data
      }
    }
    fetchListener();
  }, [params.username]);

  const getAvatarDisplay = (url: string = '') => {
    if (url.startsWith('avatar:')) return url.split(':')[1];
    if (url.startsWith('emoji:')) return url.split(':')[1];
    return '👤';
  };

  const handleCallClick = async () => {
    if (!selectedPlan) return;
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname) + '&reason=call');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Calculate payable amount based on user's current creditBalance
      const userCredits = (user as any).creditBalance || 0;
      const payableAmount = Math.max(0, selectedPlan.price - userCredits);

      if (payableAmount > 0) {
        // 2. Initiate PayU for the difference
        const payuResp = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: payableAmount,
            userId: user.uid,
            type: 'TOPUP_FOR_PLAN',
            listenerId: listener.uid,
            planId: selectedPlan.id,
            planPrice: selectedPlan.price,
            planMinutes: selectedPlan.minutes
          })
        });

        const payuData = await payuResp.json();
        if (payuData.error) throw new Error(payuData.error);

        // Redirect to PayU checkout (assuming a client-side form submission or redirect)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://secure.payu.in/_payment'; // Production URL
        
        Object.entries(payuData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        // 3. Sufficient balance, create session immediately
        const resp = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            listenerId: listener.uid,
            planId: selectedPlan.id,
            planMinutes: selectedPlan.minutes,
            planPrice: selectedPlan.price,
            creditsUsed: selectedPlan.price // Total price will be covered by credits
          })
        });

        const { sessionId, error } = await resp.json();
        if (error) throw new Error(error);
        router.push(`/call/${sessionId}`);
      }
    } catch (err: any) {
      console.error('Call initialization failed:', err);
      alert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Star rating distribution (demo)
  const ratingDist = [
    { stars: 5, pct: 72 },
    { stars: 4, pct: 18 },
    { stars: 3, pct: 6 },
    { stars: 2, pct: 3 },
    { stars: 1, pct: 1 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ─── Banner ─── */}
      <div className="relative h-[200px] md:h-[260px] bg-gradient-to-br from-accent/20 via-accent-soft to-purple-soft overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <span className="text-[120px]">{getAvatarDisplay(listener.avatarUrl)}</span>
        </div>
      </div>

      {/* ─── DP ─── */}
      <div className="px-4 -mt-14">
        <div className="w-[120px] h-[120px] rounded-full bg-surface flex items-center justify-center text-5xl border-4 border-accent shadow-lg mx-auto md:mx-0">
          {getAvatarDisplay(listener.avatarUrl)}
        </div>
      </div>

      <div className="px-4 mt-4 max-w-[700px] mx-auto md:mx-0 md:px-8">
        {/* ─── Name & Headline ─── */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {listener.displayName}
            </h1>
            {listener.isVerified && (
              <span className="text-[14px]" title="Verified">✅</span>
            )}
          </div>
          <p className="text-accent italic text-[14px] font-light">{listener.headline}</p>
          <p className="mt-1 text-[13px] text-text-muted">
            ⭐ {listener.ratingAvg?.toFixed(1)} · {listener.totalSessions} sessions
          </p>
        </div>

        {/* ─── Bio ─── */}
        <div className="mt-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className={`text-[14px] text-text-secondary font-light leading-relaxed ${!showFullBio && (listener.bio?.length || 0) > 100 ? 'line-clamp-3' : ''}`}>
            {listener.bio}
          </p>
          {(listener.bio?.length || 0) > 100 && (
            <button
              onClick={() => setShowFullBio(!showFullBio)}
              className="text-accent text-[13px] font-medium mt-1 flex items-center gap-1"
            >
              {showFullBio ? 'Kam dikhao' : 'Aur padhein'} <ChevronDown size={14} className={showFullBio ? 'rotate-180' : ''} />
            </button>
          )}
        </div>

        {/* ─── Specialties ─── */}
        <div className="mt-4 flex flex-wrap gap-1.5 animate-fade-in" style={{ animationDelay: '150ms' }}>
          {listener.specialties?.map((s) => (
            <span key={s} className="px-3 py-1 rounded-lg text-[12px] font-medium bg-accent-soft text-accent">
              {SPECIALTY_LABELS[s]}
            </span>
          ))}
        </div>

        {/* ─── Gender & Age ─── */}
        <p className="mt-3 text-[13px] text-text-muted">
          👤 {listener.gender === 'female' ? 'Female' : listener.gender === 'male' ? 'Male' : listener.gender} · {listener.age} saal
        </p>

        {/* ─── Plans Section ─── */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h3 className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Mere Plans
          </h3>
          <div className="mt-3 flex gap-3 overflow-x-auto scroll-snap-x pb-2">
            {listener.plans?.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
                className={`flex-shrink-0 w-[200px] p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan?.id === plan.id
                    ? 'border-accent bg-accent-soft shadow-md'
                    : 'border-border bg-surface hover:border-accent/30'
                }`}
              >
                <h4 className="text-[14px] font-bold">{plan.heading}</h4>
                <p className="mt-1 text-accent font-semibold text-[15px]">
                  {plan.minutes} min · ₹{plan.price}
                </p>
                {plan.description && (
                  <p className="mt-1 text-[12px] text-text-muted">{plan.description}</p>
                )}
                {selectedPlan?.id === plan.id && (
                  <div className="mt-2 flex items-center gap-1 text-accent text-[12px] font-semibold">
                    ✓ Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Reviews ─── */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <h3 className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Logon ne kya kaha 💬
          </h3>

          {/* Rating bars */}
          <div className="mt-3 space-y-1.5">
            {ratingDist.map((r) => (
              <div key={r.stars} className="flex items-center gap-2 text-[12px]">
                <span className="w-8 text-text-muted">{r.stars}★</span>
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="w-8 text-text-muted text-right">{r.pct}%</span>
              </div>
            ))}
          </div>

          {/* Sample reviews */}
          <div className="mt-4 space-y-3">
            {[
              { stars: 5, text: 'Bahut acchi baat ki. Dil halka ho gaya.', time: '2 din pehle' },
              { stars: 4, text: 'Sunne mein bahut patient hain. Recommended!', time: '5 din pehle' },
              { stars: 5, text: 'Exactly what I needed. Thank you 🙏', time: '1 hafta pehle' },
            ].map((review, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-2">
                <div className="flex items-center gap-2">
                  <span className="text-[12px]">{'⭐'.repeat(review.stars)}</span>
                </div>
                <p className="mt-1 text-[13px] text-text-secondary">{review.text}</p>
                <p className="mt-1 text-[11px] text-text-muted">Ek dost · {review.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Sticky CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-sm border-t border-border safe-bottom z-40">
        <button
          onClick={handleCallClick}
          disabled={!selectedPlan || loading}
          className={`w-full h-14 rounded-full font-semibold text-[16px] flex items-center justify-center gap-2 transition-all ${
            selectedPlan
              ? 'bg-accent text-white shadow-lg animate-pulse-ring hover:bg-accent-hover'
              : 'bg-surface-3 text-text-muted cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : selectedPlan ? (
            <>📞 Call karo · ₹{selectedPlan.price}</>
          ) : (
            'Pehle ek plan chunein'
          )}
        </button>
      </div>
    </div>
  );
}
