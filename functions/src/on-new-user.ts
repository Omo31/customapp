import { onUserCreate, UserRecord } from "firebase-functions/v2/auth";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

// Initialize the app if it hasn't been already
if (getApps().length === 0) {
  initializeApp();
}

const ALL_ROLES = [
  "dashboard", "orders", "quotes", "users", "purchase-orders",
  "accounting", "analytics", "notifications", "settings", "superadmin",
];

export const onNewUser = onUserCreate(async (event: { data: UserRecord }) => {
  const user = event.data; // The user record created
  const { email, uid } = user;

  const userDocRef = getFirestore().collection("users").doc(uid);

  // Check for the SUPER_ADMIN_EMAIL environment variable
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (email && email === superAdminEmail) {
    logger.info(`New user ${email} is the designated superadmin. Granting all roles.`);
    
    try {
      // Use set with merge to safely add roles, avoiding race conditions.
      await userDocRef.set({
        roles: ALL_ROLES,
      }, { merge: true });
      logger.info(`Successfully granted superadmin role to ${uid}`);
    } catch (error) {
      logger.error(`Error granting superadmin role to ${uid}. Error:`, error);
    }
  } else {
    logger.info(`New user ${email} registered. Assigning default 'customer' role.`);
    
    try {
        // Use set with merge for consistency and safety.
        await userDocRef.set({
            roles: ["customer"],
        }, { merge: true });
        logger.info(`Successfully assigned 'customer' role to ${uid}`);
    } catch (error) {
        logger.error(`Error assigning default role to ${uid}. Error:`, error);
    }
  }
});
