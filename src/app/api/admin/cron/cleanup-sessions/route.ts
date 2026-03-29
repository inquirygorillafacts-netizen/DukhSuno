import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

// Vercel Cron will call this API securely to cleanup orphaned sessions
export async function GET(req: Request) {
  // Simple auth for cron or admin (checking auth header)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is set, require it (Bearer <secret>)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    // Sessions older than 10 minutes that are still ringing/waiting
    const cutoffTime = new Date(now.getTime() - 10 * 60 * 1000); 

    const snapshot = await adminDb.collection('sessions')
      .where('status', 'in', ['ringing', 'waiting'])
      .where('createdAt', '<', cutoffTime)
      .get();

    let cleanedCount = 0;

    // Use a batch to clean them up and refund seekers
    const batch = adminDb.batch();

    for (const doc of snapshot.docs) {
      const sessionData = doc.data();
      const sessionId = doc.id;
      
      // Update session status to missed (auto-cleanup cut)
      batch.update(doc.ref, {
        status: 'missed',
        endedAt: admin.firestore.FieldValue.serverTimestamp(),
        missedBy: 'system_cleanup' // Identifies it as a cron cleanup
      });
      cleanedCount++;

      // Trigger Refund to Seeker (Call missed API internally or handle here)
      const amount = sessionData.planPrice || 0;
      const callerId = sessionData.callerId || sessionData.userId;
      
      if (amount > 0 && callerId) {
          const userRef = adminDb.collection('users').doc(callerId);
          const userDoc = await userRef.get();
          
          if (userDoc.exists) {
             const currentBal = userDoc.data()?.creditBalance || 0;
             batch.update(userRef, {
                 creditBalance: currentBal + amount,
                 updatedAt: admin.firestore.FieldValue.serverTimestamp()
             });
             console.log(`[Cron] Refunded ₹${amount} to ${callerId} for zombie session ${sessionId}`);
          }
      }
    }

    if (cleanedCount > 0) {
       await batch.commit();
    }

    return NextResponse.json({ 
        success: true, 
        message: `Cleaned up ${cleanedCount} orphaned sessions.` 
    });

  } catch (error) {
    console.error('Cron Cleanup Error:', error);
    return NextResponse.json({ error: 'Failed to run cleanup' }, { status: 500 });
  }
}
