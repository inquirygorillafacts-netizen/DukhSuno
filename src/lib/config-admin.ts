import { adminDb } from './firebase-admin';

export interface PlatformConfig {
  defaultCommissionRate: number; // e.g. 0.20 for 20%
  minWithdrawalAmount: number;
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  try {
    const doc = await adminDb.collection('settings').doc('platform').get();
    if (doc.exists) {
      return doc.data() as PlatformConfig;
    }
    // Return defaults if not set
    return {
      defaultCommissionRate: 0.02,
      minWithdrawalAmount: 99
    };
  } catch (err) {
    console.error('Error fetching platform config:', err);
    return {
      defaultCommissionRate: 0.02,
      minWithdrawalAmount: 99
    };
  }
}
