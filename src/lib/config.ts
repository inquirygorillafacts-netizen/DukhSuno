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

/**
 * Helper to run a promise with a timeout
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T, name: string): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutHandle = setTimeout(() => {
      console.warn(`[Config] ⏳ TIMEOUT: ${name} took longer than ${timeoutMs}ms. Using fallback.`);
      resolve(fallback);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    console.error(`[Config] ❌ ERROR in ${name}:`, error);
    return fallback;
  }
}

export async function getAppConfig(): Promise<AppConfig> {
  const now = Date.now();
  
  if (cachedConfig && (now - lastFetchTime < CACHE_TTL)) {
    return cachedConfig;
  }

  const startTime = Date.now();
  console.log('[Config] 🔄 Fetching fresh configuration...');

  try {
    // 1. Fetch Global Secrets with 5s timeout
    const secretsDoc = await withTimeout(
      adminDb.collection('admin_config').doc('secrets').get(),
      5000,
      { exists: false, data: () => ({}) } as any,
      'Firestore Secrets Fetch'
    );
    const firestoreConfig = secretsDoc.exists ? secretsDoc.data() as AppConfig : {};
    
    // 2. Fetch Multi-Twilio Accounts with 5s timeout
    const twilioSnap = await withTimeout(
      adminDb.collection('admin_config').doc('twilio_config').collection('accounts').get(),
      5000,
      { docs: [] } as any,
      'Firestore Twilio Accounts Fetch'
    );
    const twilioAccounts: TwilioAccount[] = twilioSnap.docs.map((doc: any) => ({
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

    const duration = Date.now() - startTime;
    console.log(`[Config] ✅ Config loaded in ${duration}ms (Twilio SID: ${config.TWILIO_ACCOUNT_SID ? 'OK' : 'MISSING'})`);

    cachedConfig = config;
    lastFetchTime = now;
    return config;
  } catch (error) {
    console.error('[Config] ❌ Fatal error fetching config:', error);
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
  
  // 1. DATABASE PRIORITY (Strictly rely on Firestore Twilio Pool)
  if (config.twilioAccounts && config.twilioAccounts.length > 0) {
    let acc;
    
    // Try finding the exactly requested account
    if (accountId) {
      acc = config.twilioAccounts.find(a => a.id === accountId);
    }
    
    // If no account ID provided, or the provided one was deleted, find any ACTIVE account in DB
    if (!acc) {
      acc = config.twilioAccounts.find(a => a.isActive === true);
    }

    // If no active ones exist, just forcefully pick the first one in the DB
    if (!acc) {
      acc = config.twilioAccounts[0];
    }

    if (acc) {
      console.log(`[Twilio Routing] 🌐 Using DATABASE Account: ${acc.name} (${acc.id})`);
      return { sid: acc.accountSid, token: acc.authToken, from: acc.phoneNumber };
    }
  }

  // 2. FALLBACK ONLY IF DATABASE IS 100% EMPTY
  console.warn('[Twilio Routing] ⚠️ Database is empty! Falling back to legacy .env variables.');
  return {
    sid: config.TWILIO_ACCOUNT_SID || '',
    token: config.TWILIO_AUTH_TOKEN || '',
    from: config.TWILIO_PHONE_NUMBER || ''
  };
}
