import twilio from 'twilio';
import { getTwilioCredentials } from './config';
import { adminDb } from './firebase-admin';

import { getBaseUrl } from './utils';

/**
 * Triggers an IVR voice call to the listener to alert them of an incoming call.
 * @param toPhoneNumber The listener's phone number.
 */
export async function triggerVoiceAlert(toPhoneNumber: string) {
  // Smart Routing: Find the user to get their linked Twilio Account
  let accountId: string | undefined = undefined;
  const userSnap = await adminDb.collection('users').where('phoneNumber', '==', toPhoneNumber).limit(1).get();
  if (!userSnap.empty) {
    accountId = userSnap.docs[0].data().twilioAccountId;
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
      to: toPhoneNumber,
      from: twilioNumber,
    });
    console.log('Twilio voice alert triggered with session audio:', call.sid);
    return call.sid;
  } catch (error) {
    console.error('Error triggering Twilio voice alert:', error);
  }
}
