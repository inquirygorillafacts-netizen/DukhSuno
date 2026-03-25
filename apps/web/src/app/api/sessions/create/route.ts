import { NextResponse } from 'next/server';
import { adminDb, adminRtdb } from '@/lib/firebase-admin';
import { triggerVoiceAlert } from '@/lib/twilio';

export async function POST(req: Request) {
  try {
    const { userId, listenerId, planId, planMinutes, planPrice, creditsUsed, payuAmount, payuTxnId } = await req.json();

    // 1. Create a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 2. Fetch Listener details for commission and phone number
    const listenerDoc = await adminDb.collection('users').doc(listenerId).get();
    if (!listenerDoc.exists) {
      return NextResponse.json({ error: 'Listener not found' }, { status: 404 });
    }
    const listenerData = listenerDoc.data();

    // 3. Calculate commission (0% for first 6 months)
    const registeredAt = listenerData?.registeredAt?.toDate() || new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const commissionRate = registeredAt > sixMonthsAgo ? 0 : 0.20; // 20% after 6 months

    const session = {
      sessionId,
      userId,
      listenerId,
      planId,
      planMinutes,
      planPrice,
      creditsUsed: creditsUsed || 0,
      payuAmount: payuAmount || 0,
      payuTxnId: payuTxnId || null,
      status: 'waiting',
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

    // 4. Write session to Firestore
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
