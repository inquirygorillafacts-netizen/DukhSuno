import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'twilio_accounts') {
      const snap = await adminDb.collection('admin_config').doc('twilio_config').collection('accounts').get();
      const accounts = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json({ accounts });
    }

    const doc = await adminDb.collection('settings').doc('platform').get();
    if (doc.exists) {
      return NextResponse.json(doc.data());
    }
    return NextResponse.json({
      defaultCommissionRate: 0.02,
      minWithdrawalAmount: 99
    });
  } catch (error) {
    console.error('[Admin Config] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await adminDb.collection('settings').doc('platform').set({
      ...data,
      updatedAt: new Date()
    }, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
