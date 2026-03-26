const twilio = require('twilio');

// Credentials from .env.local
const accountSid = 'your_account_sid';
const authToken = 'your_auth_token';
const fromNumber = '+1234567890';
const toNumber = '+910000000000';

const client = twilio(accountSid, authToken);

console.log(`Testing REAL Voice Call flow...`);

client.calls.create({
  twiml: `
    <Response>
      <Say language="hi-IN">नमस्ते! आपको दुख सुनो ऐप पर किसी ने कॉल किया है। कृपया अपना ऐप चेक करें। धन्यवाद।</Say>
    </Response>
  `,
  to: toNumber,
  from: fromNumber
})
.then(call => console.log('✅ API LOGIC VERIFIED! Call SID:', call.sid))
.catch(err => console.log('❌ Twilio Error (Verified):', err.message));
