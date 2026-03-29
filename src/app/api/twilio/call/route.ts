import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { getAppConfig, getTwilioCredentials } from '@/lib/config';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const startTime = Date.now();
  // console.log('[Twilio Call] 🚀 New call request started');
  try {
    const { phoneNumber, simulate = false, accountId: manualAccountId } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    let finalAccountId = manualAccountId;

    // Smart Routing Logic
    const routingStart = Date.now();
    if (!finalAccountId) {
      const userSnap = await adminDb.collection('users')
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get();
      
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        if (userData.isBlocked) {
            return NextResponse.json({ 
                error: 'We apologize, but your account has been restricted. You cannot make calls.' 
            }, { status: 403 });
        }
        finalAccountId = userData.twilioAccountId;
      }
      
      // If after checking the linked user, we STILL don't have an account ID, it means this number
      // is completely unverified or has no Twilio Account mapped to it yet. We must force manual selection.
      if (!finalAccountId) {
          return NextResponse.json({ 
                error: 'This number is not linked to any Twilio account yet. Please select an account from the dropdown manually.' 
          }, { status: 400 });
      }
    }

    // Credentials Lookup
    const credsStart = Date.now();
    const { sid: accountSid, token: authToken, from: twilioNumber } = await getTwilioCredentials(finalAccountId);
    // console.log(`[Twilio Call] 🔑 Credentials fetched in ${Date.now() - credsStart}ms`);

    if (!accountSid || !authToken) {
      console.error('[Twilio Call] ❌ Credentials missing');
      return NextResponse.json({ error: 'Twilio credentials not found' }, { status: 401 });
    }

    const client = twilio(accountSid, authToken);
    
    if (simulate) {
      console.log(`[Twilio Call] ⚡ SIMULATION MODE for ${phoneNumber}`);
      return NextResponse.json({ status: 'simulated' });
    }

    // Twilio Call Initiation
    const twilioStart = Date.now();

    // Use <Say> to ensure local testing doesn't fail due to inaccessible local mp3 URLs
    const call = await client.calls.create({
       twiml: `
        <Response>
          <Say voice="alice" language="hi-IN">Hello! Aapko Big Suno app par ek nayi call aayi hai. Kripya app open karein.</Say>
          <Pause length="1"/>
          <Say voice="alice" language="hi-IN">Hello! Aapko Big Suno app par ek nayi call aayi hai. Kripya app open karein.</Say>
          <Hangup/>
        </Response>
       `,
       to: phoneNumber,
       from: twilioNumber || '', 
    });

    const totalDuration = Date.now() - startTime;
    // console.log(`[Twilio Call] ✅ Call triggered successfully in ${totalDuration}ms. SID: ${call.sid}`);
    return NextResponse.json({ 
       sid: call.sid,
       status: 'calling'
    });

  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error(`[Twilio Call] ❌ FAILED after ${totalDuration}ms:`, error);
    
    if (error.code === 21211 || error.message.includes('not verified')) {
        return NextResponse.json({ 
            error: 'This number is not verified on Twilio. Trial accounts can only call verified caller IDs.' 
        }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || 'Call failed' }, { status: 500 });
  }
}
