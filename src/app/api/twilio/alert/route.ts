import { NextResponse } from 'next/server';
import { triggerVoiceAlert } from '@/lib/twilio';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const callSid = await triggerVoiceAlert(phoneNumber);

    return NextResponse.json({ success: true, callSid });
  } catch (error) {
    console.error('Twilio alert API error:', error);
    return NextResponse.json({ error: 'Failed to trigger alert' }, { status: 500 });
  }
}
