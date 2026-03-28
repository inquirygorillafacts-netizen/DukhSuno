import { getAppConfig } from '../src/lib/config';

async function test() {
  console.log('Starting getAppConfig test...');
  const start = Date.now();
  try {
    const config = await getAppConfig();
    console.log('Config fetched in', Date.now() - start, 'ms');
    console.log('Twilio SID:', config.TWILIO_ACCOUNT_SID ? 'PRESENT' : 'MISSING');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test().then(() => process.exit(0));
