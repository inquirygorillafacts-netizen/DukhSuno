import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { getAppConfig } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const config = await getAppConfig();
    const accountSid = config.TWILIO_ACCOUNT_SID;
    const authToken = config.TWILIO_AUTH_TOKEN;
    const twilioNumber = config.TWILIO_PHONE_NUMBER;

    const client = twilio(accountSid, authToken);
    
    // Diagnostic Logging (Partial for safety)
    console.log(`Twilio Debug: SID [${accountSid?.substring(0, 5)}...], Token [${authToken ? 'EXISTS' : 'MISSING'}], Lengths [${accountSid?.length || 0}/${authToken?.length || 0}]`);
    
    const { phoneNumber, simulate = false } = await req.json();

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
