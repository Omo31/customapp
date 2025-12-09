
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
      // The user profile document is created on the client-side during signup.
      // This function will now UPDATE that document to add the roles.
      // Using .update() is safer as it won't overwrite other fields if they exist.
      await userDocRef.update({
        roles: ALL_ROLES,
      });
      logger.info(`Successfully granted superadmin role to ${uid}`);
    } catch (error) {
      logger.error(`Error granting superadmin role to ${uid}. The user document may not exist yet or there was a permission issue. Error:`, error);
      // You might want to add retry logic or more robust error handling here in a production app.
    }
  } else {
    logger.info(`New user ${email} registered. No special roles assigned.`);
  }
});
