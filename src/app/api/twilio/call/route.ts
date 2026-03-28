import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { getAppConfig, getTwilioCredentials } from '@/lib/config';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log('[Twilio Call] 🚀 New call request started');
  
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
            console.error(`[Twilio Call] ❌ Blocked attempted call from ${phoneNumber}`);
            return NextResponse.json({ 
                error: 'Hum kshama chahte hain, aapka account block kar diya gaya hai aur aap call nahi kar sakte.' 
            }, { status: 403 });
        }
        finalAccountId = userData.twilioAccountId;
      }
    }
    console.log(`[Twilio Call] 🔍 Routing complete in ${Date.now() - routingStart}ms`);

    // Credentials Lookup
    const credsStart = Date.now();
    const { sid: accountSid, token: authToken, from: twilioNumber } = await getTwilioCredentials(finalAccountId);
    console.log(`[Twilio Call] 🔑 Credentials fetched in ${Date.now() - credsStart}ms`);

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
    const host = req.headers.get('host') || 'dukhsuno.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const audioUrl = `${protocol}://${host}/ringtone.mp3`;

    console.log(`[Twilio Call] 📞 Initiating real call to ${phoneNumber} from ${twilioNumber}`);
    
    const call = await client.calls.create({
       twiml: `
        <Response>
          <Play>${audioUrl}</Play>
          <Hangup/>
        </Response>
       `,
       to: phoneNumber,
       from: twilioNumber || '', 
    });

    const totalDuration = Date.now() - startTime;
    console.log(`[Twilio Call] ✅ Call triggered successfully in ${totalDuration}ms. SID: ${call.sid}`);

    return NextResponse.json({ 
       sid: call.sid,
       status: 'calling'
    });

  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error(`[Twilio Call] ❌ FAILED after ${totalDuration}ms:`, error);
    
    if (error.code === 21211 || error.message.includes('not verified')) {
        return NextResponse.json({ 
            error: 'यह नंबर Twilio पर वेरिफाइड नहीं है। ट्रायल अकाउंट में सिर्फ वेरिफाइड नंबर्स को कॉल किया जा सकता है।' 
        }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || 'Call failed' }, { status: 500 });
  }
}
