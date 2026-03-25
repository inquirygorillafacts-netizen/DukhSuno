import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';

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

    const salt = process.env.PAYU_SALT!;

    // Verify hash integrity
    // sha512(SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const hashStr = `${salt}|${status}|${data.udf10 || ''}|${data.udf9 || ''}|${data.udf8 || ''}|${data.udf7 || ''}|${data.udf6 || ''}|${data.udf5 || ''}|${data.udf4 || ''}|${listenerId}|${userId}|${type}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashStr).digest('hex');

    if (calculatedHash !== hash) {
      console.error('Hash mismatch! Potential fraud attempt.');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/payment/failed?error=hash_mismatch`);
    }

    if (status === 'success') {
      if (type === 'credit_reload') {
        // Add credits to user
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const currentBalance = userDoc.data()?.creditBalance || 0;
          await userRef.update({
            creditBalance: currentBalance + parseFloat(amount),
            updatedAt: new Date(),
          });
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
