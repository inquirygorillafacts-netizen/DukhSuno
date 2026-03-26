const twilio = require('twilio');

// Credentials from .env.local
const accountSid = 'your_account_sid';
const authToken = 'your_auth_token';
const fromNumber = '+1234567890';
const toNumber = '+910000000000';

const client = twilio(accountSid, authToken);

console.log(`--- DukhSuno Twilio Terminal Test ---`);
console.log(`Calling: ${toNumber}`);
console.log(`From: ${fromNumber}`);
console.log(`-------------------------------------`);

client.calls.create({
  twiml: '<Response><Say language="hi-IN">Namaste! Yeh DukhSuno app se ek test call hai.</Say></Response>',
  to: toNumber,
  from: fromNumber
})
.then(call => {
  console.log('\n✅ SUCCESS!');
  console.log('Call SID:', call.sid);
  console.log('Status:', call.status);
})
.catch(err => {
  console.log('\n❌ TWILIO ERROR RECEIVED:');
  console.log('Message:', err.message);
  console.log('Code:', err.code);
  
  if (err.code === 21408) {
    console.log('\n💡 SUGGESTION: Permission denied for this region.');
  } else if (err.message.includes('not verified')) {
    console.log('\n💡 SUGGESTION: This number needs to be verified in Twilio Console first (Trial Limit).');
  }
});
