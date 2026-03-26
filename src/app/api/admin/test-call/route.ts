import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { phoneNumber, audioUrl } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Default test audio if none provided
    const mp3Url = audioUrl || 'https://demo.twilio.com/docs/classic.mp3';

    // Initiate the call with inline TwiML to play the MP3
    const call = await client.calls.create({
      twiml: `<Response><Play>${mp3Url}</Play></Response>`,
      to: phoneNumber,
      from: twilioNumber as string,
    });

    return NextResponse.json({ 
      success: true, 
      callSid: call.sid,
      status: call.status 
    });

  } catch (error: any) {
    console.error('Twilio test call error:', error);
    return NextResponse.json({ error: error.message || 'Failed to initiate call' }, { status: 500 });
  }
}
