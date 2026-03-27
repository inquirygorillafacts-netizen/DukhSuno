import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    const sessionRef = adminDb.collection('sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    if (sessionData?.status === 'completed' || sessionData?.status === 'refunded') {
      return NextResponse.json({ message: 'Session already processed' });
    }

    // Mark as missed
    await sessionRef.update({
      status: 'missed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Cancel Linked Transaction
    if (sessionData?.transactionId) {
      await adminDb.collection('transactions').doc(sessionData.transactionId).update({
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Refund credits if used
    const userId = sessionData?.userId;
    const amount = sessionData?.planPrice || 0; // Fixed field name to match create/route.ts

    if (amount > 0 && userId) {
      const userRef = adminDb.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
         const currentBalance = userDoc.data()?.creditBalance || 0;
         await userRef.update({
           creditBalance: currentBalance + amount,
         });
         console.log(`Refunded ₹${amount} to user ${userId} for missed session ${sessionId}`);
      }
    }

    // TODO: If it was a direct PayU payment, initiate PayU Refund API call
    // (This requires PayU Refund API credentials and endpoint)

    return NextResponse.json({ success: true, refunded: true });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: 'Refund processing failed' }, { status: 500 });
  }
}

import * as admin from 'firebase-admin';
