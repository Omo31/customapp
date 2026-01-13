
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// When deployed to Firebase, the Admin SDK automatically discovers credentials.
// Manual parsing of the service account key is not needed and can cause build errors.
let adminApp: App;

if (getApps().length === 0) {
  adminApp = initializeApp();
} else {
  adminApp = getApp();
}

const db = getFirestore(adminApp);

export { adminApp, db };
