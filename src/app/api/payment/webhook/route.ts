import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb, adminRtdb } from '@/lib/firebase-admin';
import { getAppConfig } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    
    const status = data.status as string;
    const txnid = data.txnid as string;
    const amount = data.amount as string;
    const hash = data.hash as string;
    const type = data.udf1 as string; // "credit_reload" | "direct_session"
    const userId = data.udf2 as string;
    const email = data.email as string;
    const firstname = data.firstname as string;
    const productinfo = data.productinfo as string;
    const key = data.key as string;
    const listenerId = data.udf3 as string;

    const config = await getAppConfig();
    const salt = config.PAYU_SALT;

    if (!salt) {
      console.error('PayU Salt missing in configuration');
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    // Verify hash integrity
    // sha512(SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const hashStr = `${salt}|${status}|${data.udf10 || ''}|${data.udf9 || ''}|${data.udf8 || ''}|${data.udf7 || ''}|${data.udf6 || ''}|${data.udf5 || ''}|${data.udf4 || ''}|${listenerId}|${userId}|${type}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashStr).digest('hex');

    if (calculatedHash !== hash) {
      console.error('Hash mismatch! Potential fraud attempt.');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || 'https://dukhsuno.com'}/payment/failed?error=hash_mismatch`);
    }

    if (status === 'success') {
      if (type === 'credit_reload' || type === 'TOPUP_FOR_PLAN') {
        // 1. Update credits (Add the paid amount)
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const currentBalance = userDoc.data()?.creditBalance || 0;
          await userRef.update({
            creditBalance: currentBalance + parseFloat(amount),
            updatedAt: new Date(),
          });
          console.log(`Updated credits for ${userId}: +₹${amount}`);
        }

        // 2. If it's a plan-specific topup, create the session immediately
        if (type === 'TOPUP_FOR_PLAN') {
          const planId = data.udf4 as string;
          const planPrice = parseFloat(data.udf5 as string);
          const planMinutes = parseInt(data.udf6 as string);
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          
          // Fetch centralized commission rate
          const { getPlatformConfig } = await import('@/lib/config-admin');
          const config = await getPlatformConfig();
          const commissionRate = config.defaultCommissionRate || 0.02;

          // Note: Credits are NOT deducted here, only session is created
          await adminDb.collection('sessions').doc(sessionId).set({
            sessionId,
            userId,
            listenerId,
            planId,
            planMinutes,
            planPrice,
            creditsUsed: planPrice,
            status: 'waiting',
            createdAt: new Date(),
            commissionRate,
            listenerEarned: planPrice * (1 - commissionRate),
          });

          // Setup RTDB for signaling
          await adminRtdb.ref(`sessions/${sessionId}`).set({
            status: 'ringing',
            callerId: userId,
            listenerId: listenerId,
            createdAt: Date.now(),
          });

          console.log(`Automatic session created for ${userId} -> ${listenerId}: ${sessionId}`);
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/call/${sessionId}?autoStart=true`);
        }
      } else if (type === 'direct_session') {
        // Create session
        await adminDb.collection('sessions').add({
          userId,
          listenerId,
          amount: parseFloat(amount),
          status: 'pending',
          createdAt: new Date(),
          type: 'direct_payu',
          txnid,
        });
      }
      
      console.log(`Payment success: ${txnid}, ₹${amount}, user: ${userId}, type: ${type}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/payment/success?txnid=${txnid}&type=${type}`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/payment/failed?txnid=${txnid}`);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
