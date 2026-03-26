import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    let saString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // Sanitize: Remove possible accidental leading/trailing quotes from environment variable
    if (saString) {
      saString = saString.trim();
      if ((saString.startsWith("'") && saString.endsWith("'")) || 
          (saString.startsWith('"') && saString.endsWith('"'))) {
        saString = saString.slice(1, -1);
      }
    }

    const serviceAccount = (saString && saString !== '{}') ? JSON.parse(saString) : null;
    
    const projectId = serviceAccount?.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dukhsuno-placeholder';
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${projectId}.firebaseio.com`;

    if (serviceAccount?.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
      });
    } else {
      // Build-time placeholder to prevent crashes when adminDb/adminAuth are exported
      admin.initializeApp({
        projectId: projectId,
        databaseURL: databaseURL,
      });
      console.log('Firebase Admin initialized with placeholder for build.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const adminDb = admin.firestore();
export const adminRtdb = admin.database();
export const adminAuth = admin.auth();
