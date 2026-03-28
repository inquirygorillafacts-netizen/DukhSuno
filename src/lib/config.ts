import { adminDb } from './firebase-admin';

export interface TwilioAccount {
  id: string;
  name: string;
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface AppConfig {
  PAYU_KEY?: string;
  PAYU_SALT?: string;
  PAYU_BASE_URL?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  twilioAccounts?: TwilioAccount[];
  [key: string]: any;
}

let cachedConfig: AppConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function getAppConfig(): Promise<AppConfig> {
  const now = Date.now();
  
  if (cachedConfig && (now - lastFetchTime < CACHE_TTL)) {
    return cachedConfig;
  }

  try {
    // 1. Fetch Global Secrets
    const secretsDoc = await adminDb.collection('admin_config').doc('secrets').get();
    const firestoreConfig = secretsDoc.exists ? secretsDoc.data() as AppConfig : {};
    
    // 2. Fetch Multi-Twilio Accounts
    const twilioSnap = await adminDb.collection('admin_config').doc('twilio_config').collection('accounts').get();
    const twilioAccounts: TwilioAccount[] = twilioSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TwilioAccount));

    // Merge with process.env as FIRST PRIORITY for local development
    const config: AppConfig = {
      ...firestoreConfig,
      PAYU_KEY: process.env.PAYU_KEY || firestoreConfig.PAYU_KEY,
      PAYU_SALT: process.env.PAYU_SALT || firestoreConfig.PAYU_SALT,
      PAYU_BASE_URL: process.env.PAYU_BASE_URL || firestoreConfig.PAYU_BASE_URL,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || firestoreConfig.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || firestoreConfig.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || firestoreConfig.TWILIO_PHONE_NUMBER,
      twilioAccounts: twilioAccounts,
    };

    cachedConfig = config;
    lastFetchTime = now;
    return config;
  } catch (error) {
    console.error('Error fetching config from Firestore:', error);
    return {
      PAYU_KEY: process.env.PAYU_KEY,
      PAYU_SALT: process.env.PAYU_SALT,
      PAYU_BASE_URL: process.env.PAYU_BASE_URL,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      twilioAccounts: [],
    };
  }
}

/**
 * Helper to get a specific Twilio account or the default one
 */
export async function getTwilioCredentials(accountId?: string): Promise<{ sid: string, token: string, from: string }> {
  const config = await getAppConfig();
  
  if (accountId && config.twilioAccounts) {
    const acc = config.twilioAccounts.find(a => a.id === accountId);
    if (acc) {
      return { sid: acc.accountSid, token: acc.authToken, from: acc.phoneNumber };
    }
  }

  // Fallback to legacy/default config
  return {
    sid: config.TWILIO_ACCOUNT_SID || '',
    token: config.TWILIO_AUTH_TOKEN || '',
    from: config.TWILIO_PHONE_NUMBER || ''
  };
}
