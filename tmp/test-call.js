const twilio = require('twilio');

const accountSid = 'AC71d102ae215977b5046d7235a799d8e3';
const authToken = 'db0927a71fe9afd4cb19d7a756cb1b42';
const client = twilio(accountSid, authToken);

const numbers = ['+917878022373', '+918302806913'];

async function testParallelCalls() {
  console.log('Initiating parallel calls...');
  const results = await Promise.all(numbers.map(async (num) => {
    try {
      const call = await client.calls.create({
         twiml: `<Response><Pause length="1"/><Play>https://dukhsuno.com/ringtone.mp3</Play><Pause length="1"/><Hangup/></Response>`,
         to: num,
         from: '+15075785532'
      });
      return { number: num, sid: call.sid };
    } catch (error) {
      return { number: num, error: error.message };
    }
  }));
  console.log('Results:', JSON.stringify(results, null, 2));
}

testParallelCalls();
