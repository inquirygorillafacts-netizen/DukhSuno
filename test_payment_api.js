const fetch = require('node-fetch');

async function testInitiate() {
  const url = 'http://localhost:3000/api/payment/initiate';
  const body = {
    amount: 100,
    userId: 'TEST_USER_ID',
    type: 'credit_reload'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.params && data.params.hash) {
      console.log('SUCCESS: Hash generated successfully.');
      console.log('TXNID:', data.params.txnid);
    } else {
      console.error('FAILURE: Hash or params missing.');
    }
  } catch (err) {
    console.error('ERROR calling API:', err.message);
  }
}

testInitiate();
