import { adminDb } from './firebase-admin';
import * as admin from 'firebase-admin';

export type LogType = 'success' | 'info' | 'warning' | 'error';

export async function logActivity(data: {
  event: string;
  user: string;
  target: string;
  type: LogType;
  metadata?: any;
}) {
  try {
    await adminDb.collection('audit_logs').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
