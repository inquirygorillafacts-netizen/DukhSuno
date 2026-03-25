import crypto from 'crypto';

const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT = process.env.PAYU_SALT;

export interface PayUData {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  service_provider: string;
}

/**
 * Generates a PayU hash for a transaction.
 */
export function generatePayUHash(data: {
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
}) {
  if (!PAYU_KEY || !PAYU_SALT) {
    throw new Error('PayU credentials missing');
  }

  const hashString = `${PAYU_KEY}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${PAYU_SALT}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  return hash;
}

export function getPayUConfig() {
  return {
    key: PAYU_KEY,
    salt: PAYU_SALT,
    baseUrl: process.env.PAYU_BASE_URL || 'https://sandboxsecure.payu.in', // Default to sandbox
  };
}
