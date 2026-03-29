import twilio from 'twilio';
import { getTwilioCredentials } from './config';
import { adminDb } from './firebase-admin';
import { getBaseUrl } from './utils';

/**
 * Triggers an IVR voice call to the listener to alert them of an incoming call.
 * @param toPhoneNumber The listener's phone number.
 */
export async function triggerVoiceAlert(toPhoneNumber: string) {
  // Normalize: Add +91 if missing and no other prefix exists
  const formattedTo = toPhoneNumber.startsWith('+') ? toPhoneNumber : `+91${toPhoneNumber}`;

  // Smart Routing: Find the user to get their linked Twilio Account
  let accountId: string | undefined = undefined;
  try {
    const userSnap = await adminDb.collection('users').where('phoneNumber', '==', toPhoneNumber).limit(1).get();
    if (!userSnap.empty) {
      accountId = userSnap.docs[0].data().twilioAccountId;
    }
  } catch (error) {
    console.error('Error in Twilio user routing lookup:', error);
  }

  const { sid: accountSid, token: authToken, from: twilioNumber } = await getTwilioCredentials(accountId);

  if (!accountSid || !authToken || !twilioNumber) {
    console.warn('Twilio credentials not set, skipping voice alert.');
    return;
  }

  const client = twilio(accountSid, authToken);
  const ringtoneUrl = `${getBaseUrl()}/ringtone.mp3`;

  try {
    const call = await client.calls.create({
      twiml: `<Response>
                <Play>${ringtoneUrl}</Play>
                <Pause length="1"/>
                <Play>${ringtoneUrl}</Play>
                <Hangup/>
              </Response>`,
      to: formattedTo,
      from: twilioNumber,
    });
    console.log('Twilio voice alert triggered with session audio:', call.sid);
    return call.sid;
  } catch (error) {
    console.error('Error triggering Twilio voice alert:', error);
  }
}

/**
 * Triggers an emergency TTS voice call to all configured Admins.
 */
export async function triggerUrgentTTS(toPhoneNumber: string) {
  const formattedTo = toPhoneNumber.startsWith('+') ? toPhoneNumber : `+91${toPhoneNumber}`;

  const { sid: accountSid, token: authToken, from: twilioNumber } = await getTwilioCredentials();

  if (!accountSid || !authToken || !twilioNumber) {
    console.warn('Twilio credentials not set, skipping urgent TTS.');
    return;
  }

  const client = twilio(accountSid, authToken);

  try {
    const call = await client.calls.create({
      twiml: `<Response>
                <Say voice="Polly.Aditi" language="hi-IN">Sir kisi ko emergency help chahiye big suno me.</Say>
                <Pause length="1"/>
                <Say voice="Polly.Aditi" language="hi-IN">Sir kisi ko emergency help chahiye big suno me.</Say>
                <Pause length="1"/>
                <Say voice="Polly.Aditi" language="hi-IN">Kripya app kholein.</Say>
                <Hangup/>
              </Response>`,
      to: formattedTo,
      from: twilioNumber,
    });
    console.log('Twilio Urgent TTS triggered:', call.sid);
    return call.sid;
  } catch (error) {
    console.error('Error triggering Twilio Urgent TTS:', error);
  }
}
