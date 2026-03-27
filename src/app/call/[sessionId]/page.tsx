'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CallingScreen } from '@/components/call/CallingScreen';
import { ActiveCallScreen } from '@/components/call/ActiveCallScreen';
import { RatingModal } from '@/components/call/RatingModal';
import { useCallStore } from '@/stores/call-store';
import { useAuthStore } from '@/stores/auth-store';
import { startCall, answerCall } from '@/lib/webrtc';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Session, DukhSunoUser } from '@/types';

export default function CallPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const { sessionId } = use(params);
  const { user, activeRole } = useAuthStore();
  const {
    callState, setCallState, setHandler, setIncomingEmoji,
    startTimer, stopTimer, endCall, resetCall
  } = useCallStore();

  const [session, setSession] = useState<Session | null>(null);
  const [listener, setListener] = useState<DukhSunoUser | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Session & Listener
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(doc(db, 'sessions', sessionId), async (docSnap) => {
      if (docSnap.exists()) {
        const sessionData = docSnap.data() as Session;
        setSession(sessionData);

        // If listener not fetched yet, fetch them
        if (!listener && sessionData.listenerId) {
          const listenerSnap = await getDoc(doc(db, 'users', sessionData.listenerId));
          if (listenerSnap.exists()) {
            setListener(listenerSnap.data() as DukhSunoUser);
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

    const initialize = async () => {
      try {
        setCallState('ringing');

        const onEmoji = (emoji: string) => setIncomingEmoji(emoji);
        const onConnected = async () => {
          setCallState('active');
          
          // ─── Deduct Credits & Create Transaction (Atomic) ───
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
            // Even if deduction fails, we might want to allow the call but log the error
          }
        };

        let handler;
        if (activeRole === 'sunane_wala') {
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
            alert('Listener abhi doosri call पर hain. Kripya thodi der baad koshish karein.');
            router.replace('/sunane/home');
            return;
          }
          if (data.error === 'RECIPIENT_ON_HOLIDAY') {
            alert('Ye aaj ke liye chhuti par hai 🌴. Kripya kisi aur ko call karein.');
            router.replace('/sunane/home');
            return;
          }
        } else {
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
  useEffect(() => {
    if (callState === 'active' && session) {
      const maxSeconds = (session.planMinutes || 5) * 60;
      if (useCallStore.getState().sessionDuration >= maxSeconds) {
        console.log("Auto-cutting call...");
        handleEndCallRequest('auto');
      }
    }
  }, [useCallStore.getState().sessionDuration, callState, session]);

  useEffect(() => {
    if (callState === 'ended') {
      setShowRating(true);
    }
  }, [callState]);

  const handleEndCallRequest = async (cutBy: 'speaker' | 'listener' | 'auto') => {
    if (cutBy === 'speaker') {
      if (!confirm("Aapke paise lag chuke hain! Kya aap paka call kaatna chahte hain?")) return;
    } else if (cutBy === 'listener') {
      if (!confirm("Agar aap call kaatenge to transaction radd ho jayegi aur paise wapas chale jayenge. Kya aap paka call kaatna chahte hain?")) return;
      
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
          const listenerSnap = await firestoreTransaction.get(listenerRef);
          if (listenerSnap.exists()) {
            const currentBalance = listenerSnap.data().availableBalance || 0;
            const currentTotal = listenerSnap.data().totalEarnings || 0;
            
            // Calculate net from the session record
            const net = session.listenerEarned || 0;
            
            firestoreTransaction.update(listenerRef, {
              inCall: false,
              availableBalance: currentBalance + net,
              totalEarnings: currentTotal + net
            });
          }
        });
      } catch (err) {
        console.error("Failed to complete session and activate transaction:", err);
      }
    }
    resetCall();
    router.replace(activeRole === 'sunane_wala' ? '/sunane/home' : '/sunne/dashboard');
  };

  const handleSkip = () => {
    setShowRating(false);
    resetCall();
    router.replace(activeRole === 'sunane_wala' ? '/sunane/home' : '/sunne/dashboard');
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
          onEnd={() => handleEndCallRequest(activeRole === 'sunane_wala' ? 'speaker' : 'listener')}
        />
      )}

      {showRating && (
        <RatingModal onSubmit={handleRatingSubmit} onSkip={handleSkip} />
      )}
    </div>
  );
}
