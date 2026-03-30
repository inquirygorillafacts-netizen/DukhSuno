import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { triggerVoiceAlert } from '@/lib/twilio';
import { Expo } from 'expo-server-sdk';
import * as admin from 'firebase-admin';

const expo = new Expo();

export async function POST(req: Request) {
  try {
    const { sessionId, recipientId, callerName } = await req.json();

    const result = await adminDb.runTransaction(async (transaction) => {
      const recipientRef = adminDb.collection('users').doc(recipientId);
      const recipientSnap = await transaction.get(recipientRef);

      if (!recipientSnap.exists) {
        throw new Error('RECIPIENT_NOT_FOUND');
      }

      const recipient = recipientSnap.data() as any;
      
      // 1. Atomic Busy & Availability Check
      if (recipient.inCall) {
        throw new Error('RECIPIENT_BUSY');
      }
      // UI toggles 'isAvailable'. If false, provider is not taking calls.
      if (recipient.isAvailable === false) {
        throw new Error('RECIPIENT_OFFLINE'); 
      }

      // 2. Prevent Spamming (Rate limit: 1 call per 5 seconds per listener)
      const now = new Date();
      const lastTrigger = recipient.lastCallTriggeredAt?.toDate() || new Date(0);
      if (now.getTime() - lastTrigger.getTime() < 5000) {
        throw new Error('CALL_TOO_FREQUENT');
      }

      // 3. Mark as Busy & Update timestamp
      transaction.update(recipientRef, { 
        inCall: true, 
        lastCallTriggeredAt: admin.firestore.FieldValue.serverTimestamp() 
      });

      return recipient;
    });

    const recipient = result as any;
    
    // FETCH REAL PRESENCE FROM RTDB (Fix for PR-1)
    const { adminRtdb } = await import('@/lib/firebase-admin');
    const presenceSnap = await adminRtdb.ref(`presence/${recipientId}`).once('value');
    const presenceData = presenceSnap.val();
    
    // If the provider is currently connected to RTDB, we consider them online for signaling.
    const isOnline = presenceData?.online === true;
    const isRecentlyActive = isOnline; 

    // Multi-Cross Decision Logic
    if (isOnline && isRecentlyActive) {
      if (recipient.platform === 'mobile' && recipient.fcmToken) {
        await sendPushNotification(recipient.fcmToken, {
          type: 'incoming_call',
          sessionId,
          callerName,
        });
        return NextResponse.json({ method: 'fcm', status: 'sent' });
      } else {
        return NextResponse.json({ method: 'pwa', status: 'waiting_for_signaling' });
      }
    } else {
      if (recipient.phoneNumber) {
        await triggerVoiceAlert(recipient.phoneNumber);
        return NextResponse.json({ method: 'twilio', status: 'called' });
      }
      return NextResponse.json({ error: 'Recipient offline and no phone number' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Call trigger error:', error);
    if (['RECIPIENT_BUSY', 'RECIPIENT_OFFLINE', 'CALL_TOO_FREQUENT', 'RECIPIENT_NOT_FOUND'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

async function sendPushNotification(targetToken: string, data: any) {
  if (!Expo.isExpoPushToken(targetToken)) return;

  const messages = [{
    to: targetToken,
    sound: 'default',
    title: 'Incoming Call 📞',
    body: `${data.callerName || 'Anonymous'} is calling you on BigSuno`,
    data: data,
    priority: 'high' as any,
    channelId: 'bigsuno_calls',
  } as const];

  try {
    await expo.sendPushNotificationsAsync(messages);
  } catch (error) {
    console.error('Push error:', error);
  }
}
