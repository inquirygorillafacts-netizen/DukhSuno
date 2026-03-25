import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) return NextResponse.json({ error: 'Missing phone' }, { status: 400 });

    const callerIds = await client.outgoingCallerIds.list({ phoneNumber });
    const isVerified = callerIds.length > 0;

    return NextResponse.json({ isVerified });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const validationRequest = await client.validationRequests.create({
       friendlyName: `User-${phoneNumber}`,
       phoneNumber: phoneNumber
    });

    return NextResponse.json({ 
       validationCode: validationRequest.validationCode,
       phoneNumber: validationRequest.phoneNumber,
       status: 'calling'
    });

  } catch (error: any) {
    console.error('Twilio verification request error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
