'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CallingScreen } from '@/components/call/CallingScreen';
import { ActiveCallScreen } from '@/components/call/ActiveCallScreen';
import { RatingModal } from '@/components/call/RatingModal';
import { useCallStore } from '@/stores/call-store';
import { useAuthStore } from '@/stores/auth-store';
import { startCall, answerCall } from '@/lib/webrtc';
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Session, BigSunoUser } from '@/types';

export default function CallPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const { sessionId } = use(params);
  const { user, activeRole } = useAuthStore();
  const {
    callState, setCallState, setHandler, setIncomingEmoji,
    startTimer, stopTimer, endCall, resetCall
  } = useCallStore();

  const [session, setSession] = useState<Session | null>(null);
  const [listener, setListener] = useState<BigSunoUser | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);
  const initializeRef = useRef(false);

  // 1. Fetch Session & Listener
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(doc(db, 'sessions', sessionId), async (docSnap) => {
      if (docSnap.exists()) {
        const sessionData = docSnap.data() as Session;
        setSession(sessionData);

        // Fetch Partner (Listener if I am Speaker, Speaker if I am Listener)
        const partnerId = activeRole === 'seeker' ? sessionData.listenerId : sessionData.userId;
        
        if (!listener && partnerId) {
          const partnerSnap = await getDoc(doc(db, 'users', partnerId));
          if (partnerSnap.exists()) {
            let partnerData = partnerSnap.data() as BigSunoUser;
            
            // ─── SEEKER PRIVACY MASKING ───
            if (activeRole === 'provider') {
              partnerData = {
                ...partnerData,
                displayName: 'Seeker',
                avatarUrl: 'emoji:👤:#F3F1EC', // Default Seeker Avatar
              };
            }
            
            setListener(partnerData);
          }
        }

        // Handle remote hangup
        if (['completed', 'missed', 'cancelled_by_listener'].includes(sessionData.status || '')) {
          console.log("Call ended by remote signal or status change.");
          endCall();
        }
      } else {
        console.error('Session not found');
        router.replace('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  // 2. Initialize WebRTC
  useEffect(() => {
    if (!user || !activeRole || !sessionId || !session) return;
    if (callState !== 'idle') return;
    if (initializeRef.current) return;
    initializeRef.current = true;

    const initialize = async () => {
      try {
        console.log("🚀 Initializing call for session:", sessionId);
        setCallState('ringing');

        // ─── 40s TIMEOUT LOGIC ───
        const timeoutId = setTimeout(async () => {
          if (useCallStore.getState().callState === 'ringing' || useCallStore.getState().callState === 'connecting') {
            console.log("⏳ Call timed out after 40s.");
            
            // 1. Update status in Firestore directly to trigger remote hangup
            await updateDoc(doc(db, 'sessions', sessionId), {
              status: 'missed',
              missedBy: 'timeout',
              endedAt: serverTimestamp()
            });

            // 2. Alert and redirect
            alert("The expert is currently unavailable. Please try again later or choose another available professional.");
            router.replace('/seeker/home');
          }
        }, 40000); // 40 Seconds

        const onEmoji = (emoji: string) => setIncomingEmoji(emoji);
        const onConnected = async () => {
          clearTimeout(timeoutId); // Stop timeout on connection
          setCallState('active');
          
          try {
            const { runTransaction, doc, collection, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            await runTransaction(db, async (firestoreTransaction) => {
              const sessionRef = doc(db, 'sessions', sessionId);
              const speakerRef = doc(db, 'users', session.userId);
              
              const speakerSnap = await firestoreTransaction.get(speakerRef);
              if (!speakerSnap.exists()) return;

              const currentBalance = speakerSnap.data().creditBalance || 0;
              const cost = session.planPrice || 0;

              // Check if already active to prevent double deduction
              const sessionSnap = await firestoreTransaction.get(sessionRef);
              if (sessionSnap.data()?.status === 'active') return;

              // 1. Deduct from speaker
              firestoreTransaction.update(speakerRef, {
                creditBalance: currentBalance - cost
              });

              // 2. Create Transaction (Pending)
              const transId = `txn_${Date.now()}`;
              const transRef = doc(collection(db, 'transactions'), transId);
              
              const rate = session.commissionRate || 0;
              const fee = Math.floor(cost * rate);
              const net = cost - fee;

              firestoreTransaction.set(transRef, {
                id: transId,
                userId: session.listenerId,
                speakerId: session.userId,
                listenerId: session.listenerId,
                type: 'earning',
                amount: cost,
                commissionRate: rate * 100,
                platformFee: fee,
                listenerAmount: net,
                status: 'pending',
                description: `Call earning from session #${sessionId.slice(-4)}`,
                relatedSessionId: sessionId,
                createdAt: serverTimestamp()
              });

              // 3. Update Session
              firestoreTransaction.update(sessionRef, {
                status: 'active',
                connectedAt: serverTimestamp(),
                transactionId: transId
              });
            });

            startTimer();
          } catch (err) {
            console.error("Deduction failed:", err);
          }
        };

        let handler;
        if (activeRole === 'seeker') {
          console.log("📞 Starting outgoing call...");
          handler = await startCall(sessionId, onEmoji, onConnected);

          // Trigger Multi-Cross Calling Logic
          const resp = await fetch('/api/calls/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              recipientId: session.listenerId,
              callerName: user.displayName
            })
          });

          const data = await resp.json();
          if (data.error === 'RECIPIENT_BUSY') {
            alert('The expert is currently on another call. Please try again in a few minutes.');
            router.replace('/seeker/home');
            return;
          }
          if (data.error === 'RECIPIENT_ON_HOLIDAY') {
            alert('The expert is currently away or on leave 🌴. Please choose another available consultant.');
            router.replace('/seeker/home');
            return;
          }
        } else {
          console.log("📞 Answering incoming call...");
          handler = await answerCall(sessionId, onEmoji, onConnected);
        }

        setHandler(handler);
      } catch (err) {
        console.error('Failed to initialize call:', err);
        router.replace('/');
      }
    };

    initialize();

    return () => {
      stopTimer();
    };
  }, [user, activeRole, sessionId, session, listener]);

  // 3. Handle Auto-Cut and Call End State
  const currentDuration = useCallStore((state) => state.sessionDuration);
  useEffect(() => {
    if (callState === 'active' && session) {
      const maxSeconds = (session.planMinutes || 5) * 60;
      if (currentDuration >= maxSeconds) {
        console.log("Auto-cutting call...");
        handleEndCallRequest('auto');
      }
    }
  }, [currentDuration, callState, session]);

  useEffect(() => {
    if (callState === 'ended') {
      setShowRating(true);
    }
  }, [callState]);

  const handleEndCallRequest = async (cutBy: 'speaker' | 'listener' | 'auto') => {
    if (cutBy === 'speaker') {
      if (!confirm("This session has been billed. Are you sure you want to end the consultation?")) return;
    } else if (cutBy === 'listener') {
      if (!confirm("Ending this call will result in a full refund to the client. Do you wish to proceed?")) return;
      
      // Handle Refund & Void Transaction if Listener cuts
      try {
        const { runTransaction, doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        await runTransaction(db, async (transaction) => {
          if (!session || !sessionId) return;
          const sessionRef = doc(db, 'sessions', sessionId);
          const speakerRef = doc(db, 'users', session.userId);
          
          // 1. Refund Speaker
          const speakerSnap = await transaction.get(speakerRef);
          if (speakerSnap.exists()) {
             const currentBalance = speakerSnap.data().creditBalance || 0;
             transaction.update(speakerRef, {
               creditBalance: currentBalance + (session.planPrice || 0)
             });
          }

          // 2. Void/Delete Transaction
          if (session.transactionId) {
            transaction.delete(doc(db, 'transactions', session.transactionId));
          }

          // 3. Update Session
          transaction.update(sessionRef, {
            status: 'cancelled_by_listener',
            cutBy: 'listener',
            actualDurationSeconds: useCallStore.getState().sessionDuration
          });
        });
      } catch (err) {
        console.error("Listener refund/void failed:", err);
      }
    } else if (cutBy === 'auto') {
      if (sessionId) {
        await updateDoc(doc(db, 'sessions', sessionId), {
          status: 'completed',
          cutBy: 'auto',
          actualDurationSeconds: useCallStore.getState().sessionDuration
        });
      }
    }

    if (cutBy === 'speaker') {
      if (sessionId) {
         await updateDoc(doc(db, 'sessions', sessionId), {
           status: 'completed',
           cutBy: 'speaker',
           actualDurationSeconds: useCallStore.getState().sessionDuration
         });
      }
    }

    endCall();
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    setShowRating(false);
    // Update session and activate pre-booked transaction
    if (sessionId && session) {
      try {
        const { runTransaction, doc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        await runTransaction(db, async (transaction) => {
          const sessionRef = doc(db, 'sessions', sessionId);
          const listenerRef = doc(db, 'users', session.listenerId);
          
          // 1. Update Session Status
          transaction.update(sessionRef, {
            rating,
            ratingComment: comment,
            status: 'completed',
            endedAt: serverTimestamp()
          });

          // 2. Finalize Transaction (if needed)
          // It's already 'pending' from onConnected, no changes needed here unless we want to mark it 'finalized'
          
          // 3. Update Listener Balance & Status
          const listenerSnap = await transaction.get(listenerRef);
          if (listenerSnap.exists()) {
            const listenerData = listenerSnap.data();
            const currentBalance = listenerData.availableBalance || 0;
            const currentTotal = listenerData.totalEarnings || 0;
            
            // --- RATING AGGREGATION ---
            const prevAvg = listenerData.ratingAvg || 0;
            const prevCount = listenerData.ratingCount || 0;
            const newCount = prevCount + 1;
            const newAvg = (prevAvg * prevCount + rating) / newCount;

            // Calculate net from the session record
            const net = session.listenerEarned || 0;
            
            transaction.update(listenerRef, {
              inCall: false,
              availableBalance: currentBalance + net,
              totalEarnings: currentTotal + net,
              ratingAvg: Number(newAvg.toFixed(2)),
              ratingCount: newCount
            });
          }
        });
      } catch (err) {
        console.error("Failed to complete session and activate transaction:", err);
      }
    }
    resetCall();
    router.replace(activeRole === 'seeker' ? '/seeker/home' : '/provider/dashboard');
  };

  const handleSkip = async () => {
    setShowRating(false);
    
    // Process Provider Payment on Skip too
    if (sessionId && session && activeRole === 'seeker') {
      try {
        const { runTransaction, doc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        await runTransaction(db, async (transaction) => {
          const sessionRef = doc(db, 'sessions', sessionId);
          const listenerRef = doc(db, 'users', session.listenerId);
          
          transaction.update(sessionRef, {
            status: 'completed',
            endedAt: serverTimestamp()
          });

          const listenerSnap = await transaction.get(listenerRef);
          if (listenerSnap.exists()) {
            const currentBalance = listenerSnap.data().availableBalance || 0;
            const currentTotal = listenerSnap.data().totalEarnings || 0;
            const net = session.listenerEarned || 0;
            
            transaction.update(listenerRef, {
              inCall: false,
              availableBalance: currentBalance + net,
              totalEarnings: currentTotal + net
            });
          }
        });
      } catch (err) {
        console.error("Failed to complete session payment on skip:", err);
      }
    }
    
    resetCall();
    router.replace(activeRole === 'seeker' ? '/seeker/home' : '/provider/dashboard');
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading session...</div>;

  const bgClass = callState === 'active'
    ? 'bg-gradient-to-b from-surface to-[#1A2435]'
    : 'bg-gradient-to-b from-surface to-accent/90';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-1000 fixed inset-0 z-50 overflow-hidden flex flex-col`}>

      {(callState === 'ringing' || callState === 'connecting') && (
        <CallingScreen listener={listener || { displayName: 'User', avatarUrl: 'emoji:👤:#F3F1EC' } as any} />
      )}

      {callState === 'active' && (
        <ActiveCallScreen
          listener={listener || { displayName: 'User', avatarUrl: 'emoji:👤:#F3F1EC' } as any}
          priceInfo={{ price: session?.planPrice || 0, minutes: session?.planMinutes || 0 }}
          sessionId={sessionId}
          onEnd={() => handleEndCallRequest(activeRole === 'seeker' ? 'speaker' : 'listener')}
        />
      )}

      {showRating && (
        <RatingModal onSubmit={handleRatingSubmit} onSkip={handleSkip} />
      )}
    </div>
  );
}
