import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { getAppConfig, getTwilioCredentials } from '@/lib/config';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { phoneNumber, simulate = false, accountId: manualAccountId } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    let finalAccountId = manualAccountId;

    // Smart Routing: If no accountId provided, look up the number in DB
    if (!finalAccountId) {
      const userSnap = await adminDb.collection('users')
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get();
      
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        
        // Block Check: If user is blocked, they cannot initiate calls
        if (userData.isBlocked) {
            console.error(`Blocked attempted call from number ${phoneNumber}`);
            return NextResponse.json({ 
                error: 'Hum kshama chahte hain, aapka account block kar diya gaya hai aur aap call nahi kar sakte.' 
            }, { status: 403 });
        }

        finalAccountId = userData.twilioAccountId;
        if (finalAccountId) {
            console.log(`Smart Routing: Found existing account [${finalAccountId}] for number ${phoneNumber}`);
        }
      }
    }

    const { sid: accountSid, token: authToken, from: twilioNumber } = await getTwilioCredentials(finalAccountId);

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio credentials not found for this account' }, { status: 401 });
    }

    const client = twilio(accountSid, authToken);
    
    // Diagnostic Logging (Partial for safety)
    console.log(`Twilio Debug: Using Account [${finalAccountId || 'Default'}], SID [${accountSid?.substring(0, 5)}...], Token [${authToken ? 'EXISTS' : 'MISSING'}]`);

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // SIMULATION MODE: Only if explicitly requested
    if (simulate) {
      console.log('SIMULATION MODE: Simulating Outgoing Call to', phoneNumber);
      return NextResponse.json({ 
         status: 'simulated',
         message: 'Simulated call triggered successfully'
      });
    }

    // Construct the URL for the audio file dynamically
    const host = req.headers.get('host') || 'dukhsuno.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const audioUrl = `${protocol}://${host}/ringtone.mp3`;

    console.log('Using Audio URL for Twilio Call:', audioUrl);

    // Real Twilio Call with TwiML
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

    return NextResponse.json({ 
       sid: call.sid,
       status: 'calling'
    });

  } catch (error: any) {
    console.error('Twilio Call Error:', error);
    
    // Specific error for unverified numbers in trial
    if (error.code === 21211 || error.message.includes('not verified')) {
        return NextResponse.json({ 
            error: 'यह नंबर Twilio पर वेरिफाइड नहीं है। ट्रायल अकाउंट में सिर्फ वेरिफाइड नंबर्स को कॉल किया जा सकता है।' 
        }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || 'Call failed' }, { status: 500 });
  }
}
