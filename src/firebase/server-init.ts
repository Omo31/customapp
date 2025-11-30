
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount!),
    })
  : getApp();

const db = getFirestore(adminApp);

export { adminApp, db };
