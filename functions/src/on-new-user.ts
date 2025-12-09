
import { onUserCreate } from "firebase-functions/v2/auth";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

// Initialize the app if it hasn't been already
if (getApps().length === 0) {
  initializeApp();
}

const SUPER_ADMIN_EMAIL = "oluwagbengwumi@gmail.com";
const ALL_ROLES = [
  "dashboard", "orders", "quotes", "users", "purchase-orders",
  "accounting", "analytics", "notifications", "settings", "superadmin",
];

export const grantSuperAdminRole = onUserCreate(async (event) => {
  const user = event.data; // The user record created
  const { email, uid } = user;

  if (email === SUPER_ADMIN_EMAIL) {
    logger.info(`New user ${email} is the designated superadmin. Granting all roles.`);

    const userDocRef = getFirestore().collection("users").doc(uid);

    try {
      // Set the roles for the superadmin user.
      // This will overwrite any roles set on the client, which is what we want.
      await userDocRef.update({
        roles: ALL_ROLES,
      });
      logger.info(`Successfully granted superadmin role to ${uid}`);
    } catch (error) {
      logger.error(`Error granting superadmin role to ${uid}:`, error);
    }
  } else {
    logger.info(`New user ${email} registered. No special roles assigned.`);
  }
});
