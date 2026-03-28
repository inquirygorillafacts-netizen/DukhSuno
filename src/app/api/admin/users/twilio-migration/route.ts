import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== (process.env.ADMIN_SECRET_KEY || 'dev-secret-key')) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'AccountId is required' }, { status: 400 });
    }

    // Query users where twilioAccountId matches
    const snap = await adminDb.collection('users')
      .where('twilioAccountId', '==', accountId)
      .get();

    const users = snap.docs.map(doc => ({
      uid: doc.id,
      displayName: doc.data().displayName || 'Unknown',
      phoneNumber: doc.data().phoneNumber,
      verificationStatus: doc.data().verificationStatus,
      isVerified: doc.data().isVerified,
      twilioAccountId: doc.data().twilioAccountId
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Migration API GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== (process.env.ADMIN_SECRET_KEY || 'dev-secret-key')) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
    const { uid, targetAccountId } = await req.json();

    if (!uid || !targetAccountId) {
      return NextResponse.json({ error: 'UID and targetAccountId are required' }, { status: 400 });
    }

    // Update user's twilioAccountId
    await adminDb.collection('users').doc(uid).update({
      twilioAccountId: targetAccountId,
      lastAccountSwitchAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Migration API POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
