import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { amount, userId, type, listenerId } = await req.json();
    // type: "credit_reload" | "direct_session"

    const txnid = `DS_${Date.now()}_${userId.slice(0, 6)}`;
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!key || !salt) {
      return NextResponse.json(
        { error: 'PayU not configured' },
        { status: 500 }
      );
    }

    const hashStr = `${key}|${txnid}|${amount}|DukhSuno|User|anon@dukhsuno.app|||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashStr).digest('hex');

    return NextResponse.json({
      key,
      txnid,
      amount,
      hash,
      productinfo: 'DukhSuno',
      firstname: 'User',
      email: 'anon@dukhsuno.app',
      phone: '9999999999',
      surl: `${process.env.NEXT_PUBLIC_URL}/api/payment/webhook`,
      furl: `${process.env.NEXT_PUBLIC_URL}/api/payment/webhook`,
      udf1: type,
      udf2: userId,
      udf3: listenerId || '',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
