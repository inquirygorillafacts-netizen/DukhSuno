import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAppConfig } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const { amount, userId, type, listenerId } = reqBody;
    const config = await getAppConfig();

    const txnid = `DS_${Date.now()}_${userId.slice(0, 6)}`;
    const key = config.PAYU_KEY;
    const salt = config.PAYU_SALT;

    if (!key || !salt) {
      return NextResponse.json(
        { error: 'PayU not configured' },
        { status: 500 }
      );
    }

    const hashStr = `${key}|${txnid}|${amount}|BigSuno|User|anon@bigsuno.app|||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashStr).digest('hex');

    return NextResponse.json({
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
      udf1: type,
      udf2: userId,
      udf3: listenerId || '',
      udf4: reqBody.planId || '',
      udf5: reqBody.planPrice?.toString() || '',
      udf6: reqBody.planMinutes?.toString() || '',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
