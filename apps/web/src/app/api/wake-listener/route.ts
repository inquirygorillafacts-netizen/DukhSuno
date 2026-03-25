import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const { listenerPhone, sessionId } = await req.json();

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioSid || !twilioToken || !twilioNumber) {
      console.log('Twilio not configured. Skipping wake-up call.');
      return NextResponse.json({ triggered: false, reason: 'Twilio not configured' });
    }

    const client = twilio(twilioSid, twilioToken);
    
    // Trigger Twilio call
    await client.calls.create({
      to: listenerPhone,
      from: twilioNumber,
      twiml: `<Response>
        <Say voice="Polly.Aditi" language="hi-IN">
          Namaskar! DukhSuno app mein aapko ek call aa rahi hai.
          Kripya apna DukhSuno app kholen aur call accept karen.
          Aapki kamai aapka intezaar kar rahi hai.
        </Say>
      </Response>`,
    });

    console.log(`Wake-up call triggered for session: ${sessionId} to ${listenerPhone}`);

    return NextResponse.json({ triggered: true });
  } catch (error) {
    console.error('Twilio error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
