import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'twilio_accounts') {
      const snap = await adminDb.collection('admin_config').doc('twilio_config').collection('accounts').get();
      // SECURITY: Only return safe UI identifiers (id, name, isActive). NEVER return authToken to the client!
      const accounts = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          isActive: data.isActive
        };
      });
      return NextResponse.json({ accounts });
    }

    // Require admin secret for other config GET operations
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== (process.env.ADMIN_SECRET_KEY || 'dev-secret-key')) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
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
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== (process.env.ADMIN_SECRET_KEY || 'dev-secret-key')) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
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
