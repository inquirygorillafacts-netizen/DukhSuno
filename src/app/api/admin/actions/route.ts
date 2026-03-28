import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { logActivity } from '@/lib/audit';
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
  try {
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== (process.env.ADMIN_SECRET_KEY || 'dev-secret-key')) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    const { action, id, metadata } = await req.json();

    if (!action || !id) {
      return NextResponse.json({ error: 'Missing action or id' }, { status: 400 });
    }

    if (action === 'mark_paid') {
      const withdrawalRef = adminDb.collection('withdrawals').doc(id);
      const withdrawalDoc = await withdrawalRef.get();

      if (!withdrawalDoc.exists) {
        return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
      }

      await withdrawalRef.update({
        status: 'completed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await logActivity({
        event: 'Withdrawal Approved',
        user: 'Admin',
        target: id,
        type: 'success',
        metadata: { ...metadata, amount: withdrawalDoc.data()?.netAmount }
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'reject_withdrawal') {
      await adminDb.collection('withdrawals').doc(id).update({
        status: 'rejected',
        rejectionReason: metadata?.reason || 'No reason provided',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await logActivity({
        event: 'Withdrawal Rejected',
        user: 'Admin',
        target: id,
        type: 'warning',
        metadata: metadata
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin Action Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
