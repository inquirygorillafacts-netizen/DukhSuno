import * as admin from 'firebase-admin';

// Use a global to track initialization across hot-reloads
let isFirebaseInitialized = false;

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
    
    // Developer's specifics from asia-southeast1 region
    const projectId = serviceAccount?.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dukhsuno';
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://dukhsuno-default-rtdb.asia-southeast1.firebasedatabase.app/`;

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
    
    // Apply settings only once
    const db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });
    isFirebaseInitialized = true;
    
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const adminDb = admin.firestore();
export const adminRtdb = admin.database();
export const adminAuth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
