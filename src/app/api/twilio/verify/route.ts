import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { getTwilioCredentials } from '@/lib/config';

export async function GET(req: Request) {
  const startTime = Date.now();
  try {
    // Rely on database Twilio accounts instead of .env.local
    const { sid, token } = await getTwilioCredentials();
    const client = twilio(sid, token);

    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) return NextResponse.json({ error: 'Missing phone' }, { status: 400 });

    console.log(`[Twilio Verify] 🔍 Checking verification status for ${phoneNumber}`);
    const callerIds = await client.outgoingCallerIds.list({ phoneNumber });
    const isVerified = callerIds.length > 0;

    console.log(`[Twilio Verify] ✅ Status check complete in ${Date.now() - startTime}ms. Verified: ${isVerified}`);
    return NextResponse.json({ isVerified });
  } catch (err: any) {
    console.error(`[Twilio Verify] ❌ GET Error after ${Date.now() - startTime}ms:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const { sid, token } = await getTwilioCredentials();
    const client = twilio(sid, token);

    const { phoneNumber, simulate = false } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (simulate) {
      console.log(`[Twilio Verify] ⚡ SIMULATION MODE for ${phoneNumber}`);
      return NextResponse.json({ 
         validationCode: Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6),
         phoneNumber: phoneNumber,
         status: 'simulated'
      });
    }

    console.log(`[Twilio Verify] 📞 Requesting validation call for ${phoneNumber}`);
    const validationRequest = await client.validationRequests.create({
       friendlyName: `User-${phoneNumber}`,
       phoneNumber: phoneNumber
    });

    console.log(`[Twilio Verify] ✅ Validation request successful in ${Date.now() - startTime}ms`);
    return NextResponse.json({ 
       validationCode: validationRequest.validationCode,
       phoneNumber: validationRequest.phoneNumber,
       status: 'calling'
    });

  } catch (error: any) {
    console.error(`[Twilio Verify] ❌ POST Error after ${Date.now() - startTime}ms:`, error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
