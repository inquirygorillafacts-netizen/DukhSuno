import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { listenerId, status } = await req.json();
    // status: "verified" | "rejected"

    const userRef = adminDb.collection('users').doc(listenerId);
    
    await userRef.update({
      isVerified: status === 'verified',
      verificationStatus: status,
      updatedAt: new Date(),
    });

    console.log(`Listener ${listenerId} verification status updated to ${status}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verification API error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
