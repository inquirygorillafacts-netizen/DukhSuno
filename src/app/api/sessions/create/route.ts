import { NextResponse } from 'next/server';
import { adminDb, adminRtdb, FieldValue } from '@/lib/firebase-admin';
import { triggerVoiceAlert } from '@/lib/twilio';

export async function POST(req: Request) {
  try {
    // 1. Parse Body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    let { userId, listenerId, planId, planMinutes, planPrice } = body;

    // 2. Validate essential fields
    if (!userId || !listenerId) {
      return NextResponse.json({ error: 'Missing userId or listenerId' }, { status: 400 });
    }

    // 3. Fallback for missing plan data
    if (!planId) {
      planId = `plan_${planMinutes || 'standard'}`;
    }
    const finalPrice = Number(planPrice) || 0;

    // 4. Create a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 5. Check User Status & Balance
    const callerDoc = await adminDb.collection('users').doc(userId).get();
    
    let listenerDoc = null;
    let listenerData: any = null;

    if (listenerId !== 'all_admins') {
      listenerDoc = await adminDb.collection('users').doc(listenerId).get();
      if (!listenerDoc.exists) {
        return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
      }
      listenerData = listenerDoc.data();
    }

    if (!callerDoc.exists) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    const callerData = callerDoc.data();

    if (callerData?.isBlocked || listenerData?.isBlocked) {
      return NextResponse.json({ error: 'Account restricted' }, { status: 403 });
    }

    const currentBalance = Number(callerData?.creditBalance) || 0;
    if (currentBalance < finalPrice) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 6. Get Config (Simplified fallback)
    let commissionRate = 0.10;
    try {
      const { getPlatformConfig } = await import('@/lib/config-admin');
      const config = await getPlatformConfig();
      commissionRate = config.defaultCommissionRate ?? 0.10;
    } catch (e) {
      console.warn('Falling back to default commission:', e);
    }

    // 7. Prepare Session Document
    const session = {
      sessionId,
      callerId: userId,
      callerName: callerData?.displayName || 'Seeker',
      callerAvatar: callerData?.avatarUrl || 'emoji:👤',
      userId,
      listenerId,
      planId,
      planMinutes: Number(planMinutes) || 0,
      planPrice: finalPrice,
      creditsUsed: finalPrice,
      status: 'ringing',
      transactionId: null,
      createdAt: FieldValue.serverTimestamp(),
      connectedAt: null,
      endedAt: null,
      durationSeconds: 0,
      commissionRate,
      listenerEarned: finalPrice * (1 - commissionRate),
      rating: null,
      ratingComment: null,
      videoUnlocked: false,
    };

    // 8. Write to Firestore & RTDB (with error isolation)
    try {
      await adminDb.collection('sessions').doc(sessionId).set(session);
      
      await adminRtdb.ref(`sessions/${sessionId}`).set({
        status: 'ringing',
        callerId: userId,
        listenerId: listenerId,
        createdAt: Date.now(), // Manual timestamp for better signaling compatibility
      });
    } catch (dbError: any) {
      console.error('Database write failed:', dbError);
      return NextResponse.json({ error: 'Database write error: ' + dbError.message }, { status: 500 });
    }

    console.log('✅ Session created successfully:', sessionId);

    console.log('✅ Session created successfully:', sessionId);
    return NextResponse.json({ sessionId });

  } catch (error: any) {
    console.error('❌ Critical Session Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error', 
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
