import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAppConfig } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const { amount, userId, type, listenerId } = reqBody;
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

    // Correct PayU Hash String: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
    const hashStr = `${key}|${txnid}|${amount}|BigSuno|User|anon@bigsuno.app|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashStr).digest('hex');

    // PayU URL construction: prioritize config, fallback to production
    const baseUrl = config.PAYU_BASE_URL || 'https://secure.payu.in';
    const payuUrl = baseUrl.includes('/_payment') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/_payment`;

    return NextResponse.json({
      url: payuUrl,
      params: {
        key,
        txnid,
        amount,
        hash,
        productinfo: 'BigSuno',
        firstname: 'User',
        email: 'anon@bigsuno.app',
        phone: '9999999999',
        surl: `${process.env.NEXT_PUBLIC_URL}/api/payment/webhook`,
        furl: `${process.env.NEXT_PUBLIC_URL}/api/payment/webhook`,
        udf1: udf1,
        udf2: udf2,
        udf3: udf3,
        udf4: udf4,
        udf5: udf5,
        udf6: udf6,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
