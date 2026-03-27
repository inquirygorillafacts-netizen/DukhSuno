import { NextResponse } from 'next/server';
import { adminDb, adminRtdb } from '@/lib/firebase-admin';
import { triggerVoiceAlert } from '@/lib/twilio';

export async function POST(req: Request) {
  try {
    const { userId, listenerId, planId, planMinutes, planPrice, creditsUsed, payuAmount, payuTxnId } = await req.json();

    // 1. Create a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 2. Fetch both users to check for blocks
    const [callerDoc, listenerDoc] = await Promise.all([
      adminDb.collection('users').doc(userId).get(),
      adminDb.collection('users').doc(listenerId).get()
    ]);

    if (!callerDoc.exists || !listenerDoc.exists) {
      return NextResponse.json({ error: 'User or Listener not found' }, { status: 404 });
    }

    const callerData = callerDoc.data();
    const listenerData = listenerDoc.data();

    // BLOCK CHECK: Prevent call if either side is blocked
    if (callerData?.isBlocked || listenerData?.isBlocked) {
      return NextResponse.json({ 
        error: 'Account status restricted. Call cannot be completed.' 
      }, { status: 403 });
    }

    // 3. Get Platform Config (Centralized Commission)
    const { getPlatformConfig } = await import('@/lib/config-admin');
    const config = await getPlatformConfig();
    const commissionRate = config.defaultCommissionRate || 0.20;

    // 4. Create Session (No pre-deduction, no pre-booked transaction)
    const session = {
      sessionId,
      userId,
      listenerId,
      planId,
      planMinutes,
      planPrice,
      creditsUsed: planPrice, // The amount that WILL be used
      status: 'waiting',
      transactionId: null, // To be created on connection
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      connectedAt: null,
      endedAt: null,
      durationSeconds: 0,
      commissionRate,
      listenerEarned: planPrice * (1 - commissionRate),
      rating: null,
      ratingComment: null,
      videoUnlocked: false,
    };

    // 5. Write to Firestore
    await adminDb.collection('sessions').doc(sessionId).set(session);

    // 5. Setup WebRTC signaling state in RTDB
    await adminRtdb.ref(`sessions/${sessionId}`).set({
      status: 'ringing',
      callerId: userId,
      listenerId: listenerId,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });

    // 6. Trigger Twilio Voice Alert (IVR)
    if (listenerData?.phoneNumber) {
      // Trigger voice call to wake up the listener
      triggerVoiceAlert(listenerData.phoneNumber);
    }

    console.log('Session created and Listener notified:', sessionId);

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error in session creation:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Helper to handle admin.firestore/database if not imported
import * as admin from 'firebase-admin';
