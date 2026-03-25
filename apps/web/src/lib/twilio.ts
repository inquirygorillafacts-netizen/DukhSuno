import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Triggers an IVR voice call to the listener to alert them of an incoming call.
 * @param toPhoneNumber The listener's phone number.
 */
export async function triggerVoiceAlert(toPhoneNumber: string) {
  if (!accountSid || !authToken || !twilioNumber) {
    console.warn('Twilio credentials not set, skipping voice alert.');
    return;
  }

  try {
    const ringtoneUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://dukhsuno.com'}/ringtone.mp3`;
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
    console.log('Twilio voice alert triggered with Hindi message:', call.sid);
    return call.sid;
  } catch (error) {
    console.error('Error triggering Twilio voice alert:', error);
  }
}
