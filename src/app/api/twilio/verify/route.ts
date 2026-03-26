import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { getAppConfig } from '@/lib/config';

export async function GET(req: Request) {
  try {
    const config = await getAppConfig();
    const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

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
    const config = await getAppConfig();
    const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

    const { phoneNumber, simulate = false } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // SIMULATION MODE: If in development or simulate is true, bypass real Twilio call
    if (process.env.NODE_ENV === 'development' || simulate) {
      console.log('SIMULATION MODE: Generating dummy validation code for', phoneNumber);
      return NextResponse.json({ 
         validationCode: Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6),
         phoneNumber: phoneNumber,
         status: 'simulated'
      });
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
