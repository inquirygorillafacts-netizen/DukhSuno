import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'twilio_accounts') {
      const snap = await adminDb.collection('admin_config').doc('twilio_config').collection('accounts').get();
      const accounts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json({ accounts });
    }

    return NextResponse.json({ error: 'Invalid config type' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin Config API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
