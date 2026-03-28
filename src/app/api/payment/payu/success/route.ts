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
    const type = data.udf1 as string; // "credit_reload" | "TOPUP_FOR_PLAN" | "direct_session"
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

    // Verify reverse hash integrity
    // sha512(SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const hashStr = `${salt}|${status}|${data.udf10 || ''}|${data.udf9 || ''}|${data.udf8 || ''}|${data.udf7 || ''}|${data.udf6 || ''}|${data.udf5 || ''}|${data.udf4 || ''}|${listenerId || ''}|${userId}||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    // Wait, the hash string in webhook was:
    // `${salt}|${status}|${data.udf10 || ''}|${data.udf9 || ''}|${data.udf8 || ''}|${data.udf7 || ''}|${data.udf6 || ''}|${data.udf5 || ''}|${data.udf4 || ''}|${listenerId}|${userId}|${type}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    // Let's stick to the webhook's proven hash verification.
    const originalHashStr = `${salt}|${status}|${data.udf10 || ''}|${data.udf9 || ''}|${data.udf8 || ''}|${data.udf7 || ''}|${data.udf6 || ''}|${data.udf5 || ''}|${data.udf4 || ''}|${listenerId || ''}|${userId || ''}|${type || ''}|${email || ''}|${firstname || ''}|${productinfo || ''}|${amount || ''}|${txnid || ''}|${key || ''}`;
    const calculatedHash = crypto.createHash('sha512').update(originalHashStr).digest('hex');

    if (calculatedHash !== hash) {
      console.error('Hash mismatch! Potential fraud attempt.');
      const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://bigsuno.app';
      return NextResponse.redirect(`${baseUrl}/payment/failed?error=hash_mismatch`);
    }

    if (status === 'success') {
      if (type === 'credit_reload' || type === 'TOPUP_FOR_PLAN' || type === 'add_money') {
        // 1. Update credits
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data() || {};
          const currentBalance = userData.availableBalance || userData.balance || userData.creditBalance || 0;
          const newBalance = Number(currentBalance) + parseFloat(amount);
          
          await userRef.update({
            availableBalance: newBalance,
            balance: newBalance,
            creditBalance: newBalance, // Sync for legacy
            updatedAt: new Date(),
          });
          
          // Log transaction
          await adminDb.collection('transactions').add({
            userId,
            amount: parseFloat(amount),
            type: 'credit_reload',
            status: 'completed',
            description: 'Wallet Topup via PayU',
            txnid,
            createdAt: new Date()
          });
        }

        // 2. Handle Plan Topup logic
        if (type === 'TOPUP_FOR_PLAN') {
          const planId = data.udf4 as string;
          const planPrice = parseFloat(data.udf5 as string);
          const planMinutes = parseInt(data.udf6 as string);
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          
          const platformConfigRef = adminDb.collection('config').doc('platform');
          const platformDoc = await platformConfigRef.get();
          const commissionRate = platformDoc.data()?.defaultCommissionRate || 0.02;

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

          await adminRtdb.ref(`sessions/${sessionId}`).set({
            status: 'ringing',
            callerId: userId,
            listenerId: listenerId,
            createdAt: Date.now(),
          });

          const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://bigsuno.app';
          return NextResponse.redirect(`${baseUrl}/call/${sessionId}?autoStart=true`);
        }
      }
      
      const host = req.headers.get('host');
      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const origin = `${protocol}://${host}`;
      
      return NextResponse.redirect(`${origin}/wallet?payment=success&txnid=${txnid}&amount=${amount}&type=${type}`);
    } else {
      const host = req.headers.get('host');
      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const origin = `${protocol}://${host}`;
      return NextResponse.redirect(`${origin}/wallet?payment=failed&txnid=${txnid}`);
    }
  } catch (error) {
    console.error('Success route error:', error);
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;
    return NextResponse.redirect(`${origin}/wallet?payment=failed&error=server_error`);
  }
}
