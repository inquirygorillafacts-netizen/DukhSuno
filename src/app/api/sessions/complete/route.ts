import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

/**
 * FINALIZES A CALL SESSION AND TRANSFERS FUNDS
 * Logic: 100% (Seeker Pays) -> 20% (Platform) + 80% (Provider Earns)
 */
export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const sessionRef = adminDb.collection('sessions').doc(sessionId);
    
    const result = await adminDb.runTransaction(async (transaction) => {
      const sessionSnap = await transaction.get(sessionRef);
      if (!sessionSnap.exists) throw new Error('SESSION_NOT_FOUND');

      const session = sessionSnap.data()!;
      if (session.status === 'completed') return { alreadyDone: true };

      const seekerRef = adminDb.collection('users').doc(session.userId);
      const providerRef = adminDb.collection('users').doc(session.listenerId);

      const [seekerSnap, providerSnap] = await Promise.all([
        transaction.get(seekerRef),
        transaction.get(providerRef)
      ]);

      if (!seekerSnap.exists || !providerSnap.exists) throw new Error('USERS_NOT_FOUND');

      const planPrice = Number(session.planPrice) || 0;
      const commissionRate = 0.20; // 20% Platform Fee
      const commissionAmount = Math.floor(planPrice * commissionRate);
      const providerAmount = planPrice - commissionAmount;

      // 1. Update Session Status
      transaction.update(sessionRef, {
        status: 'completed',
        endedAt: admin.firestore.FieldValue.serverTimestamp(),
        payoutAmount: providerAmount,
        commissionAmount: commissionAmount
      });

      // 2. Deduct from Seeker (if not already fully deducted during start)
      // Note: In some flows, money is held at start. Here we finalize it.
      transaction.update(seekerRef, {
        creditBalance: admin.firestore.FieldValue.increment(-planPrice),
        totalSpent: admin.firestore.FieldValue.increment(planPrice)
      });

      // 3. Add to Provider's Wallet (Earnings)
      transaction.update(providerRef, {
        availableBalance: admin.firestore.FieldValue.increment(providerAmount),
        totalEarnings: admin.firestore.FieldValue.increment(providerAmount)
      });

      // 4. Create Transaction Records
      const seekerTxRef = adminDb.collection('transactions').doc();
      transaction.set(seekerTxRef, {
        userId: session.userId,
        sessionId: sessionId,
        amount: planPrice,
        type: 'spent',
        status: 'completed',
        description: `Paid for session with ${providerSnap.data()?.displayName || 'Expert'}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const providerTxRef = adminDb.collection('transactions').doc();
      transaction.set(providerTxRef, {
        userId: session.listenerId,
        sessionId: sessionId,
        amount: planPrice, // Gross
        providerAmount: providerAmount, // Net
        commission: commissionAmount,
        type: 'earning',
        status: 'pending', // Pending withdrawal
        description: `Earned from session with Seeker`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Session Complete] Error:', error);
    return NextResponse.json({ error: error.message || 'Payout failed' }, { status: 500 });
  }
}
