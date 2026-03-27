import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { sessionId, listenerId, rating, comment } = await req.json();

    if (!sessionId || !listenerId || !rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    // 1. Update Session Doc
    const sessionRef = adminDb.collection('sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();
    
    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await sessionRef.update({
      rating: rating,
      ratingComment: comment || '',
      ratedAt: new Date()
    });

    // 2. Atomic Update of Listener's User Doc (Recalculate Average)
    const userRef = adminDb.collection('users').doc(listenerId);
    
    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) return;

      const data = userDoc.data()!;
      const currentAvg = parseFloat(data.ratingAvg) || 0;
      const currentCount = parseInt(data.ratingCount) || 0;

      const newCount = currentCount + 1;
      const newAvg = ((currentAvg * currentCount) + rating) / newCount;

      transaction.update(userRef, {
        ratingAvg: Number(newAvg.toFixed(1)),
        ratingCount: newCount,
        updatedAt: new Date()
      });
    });

    console.log(`PRODUCTION LOG: Rating updated for listener ${listenerId}. New Count: ${sessionId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rating API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
