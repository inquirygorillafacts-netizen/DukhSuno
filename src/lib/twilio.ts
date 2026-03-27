import twilio from 'twilio';
import { getAppConfig } from './config';

/**
 * Triggers an IVR voice call to the listener to alert them of an incoming call.
 * @param toPhoneNumber The listener's phone number.
 */
export async function triggerVoiceAlert(toPhoneNumber: string) {
  const config = await getAppConfig();
  const accountSid = config.TWILIO_ACCOUNT_SID;
  const authToken = config.TWILIO_AUTH_TOKEN;
  const twilioNumber = config.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioNumber) {
    console.warn('Twilio credentials not set, skipping voice alert.');
    return;
  }

  const client = twilio(accountSid, authToken);

  try {
    const ringtoneUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bigsuno.app'}/ringtone.mp3`;
    const call = await client.calls.create({
      twiml: `<Response>
                <Pause length="1"/>
                <Play>${ringtoneUrl}</Play>
                <Pause length="1"/>
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
