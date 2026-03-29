import { NextResponse } from 'next/server';
import { triggerUrgentTTS } from '@/lib/twilio';
import { APP_CONFIG } from '@/lib/constants';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Check if there's a dynamic admin number configured in DB
    let targetPhone = APP_CONFIG.adminPhone;
    try {
      const configDoc = await adminDb.collection('settings').doc('platform').get();
      if (configDoc.exists && configDoc.data()?.adminPhone) {
        targetPhone = configDoc.data()?.adminPhone;
      }
    } catch (dbErr) {
      console.warn('Failed to load dynamic admin phone, using fallback:', dbErr);
    }
    
    // Trigger Twilio TTS call to admin
    const sid = await triggerUrgentTTS(targetPhone);
    
    console.log(`Urgent Voice TTS Alert triggered for Admin (${targetPhone}): ${sid}`);
    
    return NextResponse.json({ success: true, sid });
  } catch (error: any) {
    console.error('Error triggering urgent alert:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
