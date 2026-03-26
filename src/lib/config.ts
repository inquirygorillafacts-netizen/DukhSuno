import { adminDb } from './firebase-admin';

export interface AppConfig {
  PAYU_KEY?: string;
  PAYU_SALT?: string;
  PAYU_BASE_URL?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  [key: string]: string | undefined;
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
    const doc = await adminDb.collection('admin_config').doc('secrets').get();
    const firestoreConfig = doc.exists ? doc.data() as AppConfig : {};
    
    // Merge with process.env as fallback
    const config: AppConfig = {
      PAYU_KEY: firestoreConfig.PAYU_KEY || process.env.PAYU_KEY,
      PAYU_SALT: firestoreConfig.PAYU_SALT || process.env.PAYU_SALT,
      PAYU_BASE_URL: firestoreConfig.PAYU_BASE_URL || process.env.PAYU_BASE_URL,
      TWILIO_ACCOUNT_SID: firestoreConfig.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: firestoreConfig.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: firestoreConfig.TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER,
      ...firestoreConfig // Allow any other dynamic keys
    };

    cachedConfig = config;
    lastFetchTime = now;
    return config;
  } catch (error) {
    console.error('Error fetching config from Firestore:', error);
    // Fallback to environment variables if Firestore fails
    return {
      PAYU_KEY: process.env.PAYU_KEY,
      PAYU_SALT: process.env.PAYU_SALT,
      PAYU_BASE_URL: process.env.PAYU_BASE_URL,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    };
  }
}
