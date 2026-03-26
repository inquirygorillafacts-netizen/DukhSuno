import crypto from 'crypto';
import { getAppConfig } from './config';

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
export async function generatePayUHash(data: {
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
}) {
  const config = await getAppConfig();
  const PAYU_KEY = config.PAYU_KEY;
  const PAYU_SALT = config.PAYU_SALT;

  if (!PAYU_KEY || !PAYU_SALT) {
    throw new Error('PayU credentials missing');
  }

  const hashString = `${PAYU_KEY}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${PAYU_SALT}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  return hash;
}

export async function getPayUConfig() {
  const config = await getAppConfig();
  return {
    key: config.PAYU_KEY,
    salt: config.PAYU_SALT,
    baseUrl: config.PAYU_BASE_URL || 'https://sandboxsecure.payu.in',
  };
}
