import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { sessionId, userId } = await req.json();

    const sessionRef = adminDb.collection('sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    if (sessionData?.isVideoUnlocked) {
      return NextResponse.json({ success: true, alreadyUnlocked: true });
    }

    // Calculate upgrade price (50% of original plan price)
    const originalPrice = sessionData?.planPrice || 0;
    const upgradePrice = Math.round(originalPrice * 0.5);

    // Check user balance
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentBalance = userDoc.data()?.creditBalance || 0;

    if (currentBalance < upgradePrice) {
      // Not enough credits, provide PayU data for direct payment
      // In a real scenario, you'd generate a PayU hash specifically for this upgrade
      return NextResponse.json({ 
        success: false, 
        method: 'payu', 
        message: 'Insufficient balance',
        amountToPay: upgradePrice 
      });
    }

    // Deduct credits and unlock video
    await adminDb.runTransaction(async (transaction) => {
      transaction.update(userRef, { 
        creditBalance: currentBalance - upgradePrice 
      });
      transaction.update(sessionRef, { 
        isVideoUnlocked: true,
        upgradePrice: upgradePrice,
        upgradePaidAt: new Date()
      });
    });

    console.log(`Session ${sessionId} upgraded to video for user ${userId}. Deducted ₹${upgradePrice}`);

    return NextResponse.json({ success: true, unlocked: true });
  } catch (error) {
    console.error('Upgrade Video API error:', error);
    return NextResponse.json({ error: 'Upgrade failed' }, { status: 500 });
  }
}
