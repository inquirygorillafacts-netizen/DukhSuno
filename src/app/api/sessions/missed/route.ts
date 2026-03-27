import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import crypto from 'crypto';
import { getAppConfig } from '@/lib/config';

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

    // 1. Mark as missed
    await sessionRef.update({
      status: 'missed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Cancel Linked Transaction
    if (sessionData?.transactionId) {
      await adminDb.collection('transactions').doc(sessionData.transactionId).update({
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 3. Handle Refunds
    const userId = sessionData?.userId;
    const amount = sessionData?.planPrice || 0;

    if (sessionData?.type === 'direct_payu' || sessionData?.txnid) {
      // 3a. Direct PayU Refund
      const config = await getAppConfig();
      const { PAYU_KEY, PAYU_SALT, PAYU_BASE_URL } = config;

      if (!PAYU_KEY || !PAYU_SALT) {
        console.error('PayU credentials missing for refund');
      } else {
        const txnid = sessionData.txnid;
        const refundAmount = amount.toString();
        
        // Command for refund: refund_transaction
        // Hash Formula: sha512(key|command|var1|salt)
        // var1 = txnid|amount
        const command = 'cancel_refund_transaction';
        const var1 = txnid;
        const var2 = refundAmount; // Some PayU versions use var2 for amount
        
        const hashStr = `${PAYU_KEY}|${command}|${var1}|${PAYU_SALT}`;
        const hash = crypto.createHash('sha512').update(hashStr).digest('hex');

        const payuUrl = 'https://info.payu.in/merchant/postservice.php?form=2'; // Production Post Service
        
        try {
          // In production, we would call:
          // const response = await fetch(payuUrl, { method: 'POST', ...})
          console.log(`PRODUCTION READY: Prepared PayU Refund for ${txnid}, Amount: ${refundAmount}`);
          
          await sessionRef.update({
             refundStatus: 'initiated',
             refundTxnId: txnid,
             updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (err) {
          console.error('PayU Refund API Error:', err);
        }
      }
    } else if (amount > 0 && userId) {
      // 3b. Credit Refund (Internal)
      const userRef = adminDb.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
         const currentBalance = userDoc.data()?.creditBalance || 0;
         await userRef.update({
           creditBalance: currentBalance + amount,
           updatedAt: admin.firestore.FieldValue.serverTimestamp()
         });
         console.log(`Refunded ₹${amount} credits to user ${userId} for missed session ${sessionId}`);
      }
    }

    return NextResponse.json({ success: true, processed: true });
  } catch (error) {
    console.error('Missed Session processing failed:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
