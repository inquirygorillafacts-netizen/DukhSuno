import { NextResponse } from 'next/server';
import { triggerVoiceAlert } from '@/lib/twilio';
import { APP_CONFIG } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Trigger Twilio call to admin
    const sid = await triggerVoiceAlert(APP_CONFIG.adminPhone);
    
    console.log(`Urgent Voice Alert triggered for Admin (${APP_CONFIG.adminPhone}): ${sid}`);
    
    return NextResponse.json({ success: true, sid });
  } catch (error: any) {
    console.error('Error triggering urgent alert:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
