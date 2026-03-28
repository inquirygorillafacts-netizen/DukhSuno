import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAppConfig } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const { amount, userId, type, listenerId, firstName, email, productInfo } = reqBody;
    const config = await getAppConfig();

    const txnid = `DS_${Date.now()}_${Math.floor(Math.random() * 1000)}_${userId.slice(0, 6)}`;
    const key = config.PAYU_KEY;
    const salt = config.PAYU_SALT;

    if (!key || !salt) {
      return NextResponse.json(
        { error: 'PayU not configured' },
        { status: 500 }
      );
    }

    const udf1 = type || 'add_money';
    const udf2 = userId;
    const udf3 = listenerId || '';
    const udf4 = reqBody.planId || '';
    const udf5 = reqBody.planPrice?.toString() || '';
    const udf6 = reqBody.planMinutes?.toString() || '';

    // BharatPWA uses: key|txnid|amount|productinfo|firstname|email|||||||||||salt
    // We integrate our UDFs for database logic but maintain the same core structure.
    const pInfo = productInfo || 'BigSuno';
    const fName = firstName || 'User';
    const eMail = email || `${userId.slice(0, 8)}@bigsuno.internal`;
    
    // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
    const hashStr = `${key}|${txnid}|${amount}|${pInfo}|${fName}|${eMail}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashStr).digest('hex');

    const baseUrl = config.PAYU_BASE_URL || 'https://secure.payu.in';
    const payuUrl = baseUrl.includes('/_payment') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/_payment`;

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;

    return NextResponse.json({
      url: payuUrl,
      params: {
        key,
        txnid,
        amount,
        hash,
        productinfo: pInfo,
        firstname: fName,
        email: eMail,
        phone: '9999999999',
        surl: `${origin}/api/payment/payu/success`,
        furl: `${origin}/api/payment/payu/failure`,
        udf1: udf1,
        udf2: udf2,
        udf3: udf3,
        udf4: udf4,
        udf5: udf5,
        udf6: udf6,
      }
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
