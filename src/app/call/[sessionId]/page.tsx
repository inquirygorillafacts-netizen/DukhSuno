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
        if (sessionData.status === 'completed' || sessionData.status === 'missed') {
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
          startTimer();
          // Update session status in Firestore
          await updateDoc(doc(db, 'sessions', sessionId), {
            status: 'active',
            connectedAt: new Date()
          });
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

  // 3. Handle call end
  useEffect(() => {
    if (callState === 'ended') {
      setShowRating(true);
    }
  }, [callState]);

  const handleRatingSubmit = async (rating: number, comment: string) => {
    setShowRating(false);
    // Update session with rating
    if (sessionId) {
      await updateDoc(doc(db, 'sessions', sessionId), {
        rating,
        ratingComment: comment,
        status: 'completed',
        endedAt: new Date()
      });
      // Reset listener status
      if (session?.listenerId) {
        await updateDoc(doc(db, 'users', session.listenerId), { inCall: false });
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
        />
      )}

      {showRating && (
        <RatingModal onSubmit={handleRatingSubmit} onSkip={handleSkip} />
      )}
    </div>
  );
}
