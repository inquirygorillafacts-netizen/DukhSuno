import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const doc = await adminDb.collection('settings').doc('platform').get();
    if (doc.exists) {
      return NextResponse.json(doc.data());
    }
    return NextResponse.json({
      defaultCommissionRate: 0.20,
      minWithdrawalAmount: 500
    });
  } catch (error) {
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
