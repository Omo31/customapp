import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let adminApp: App;

if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
} else {
  adminApp = getApp();
}


const db = getFirestore(adminApp);

export { adminApp, db };
