/**
 * @fileoverview
 * This file contains a Cloud Function that triggers on new user creation.
 * It assigns a 'superadmin' role if the user's email matches a specific
 * environment variable, otherwise it assigns a default 'customer' role.
 */

const { onUserCreate } = require("firebase-functions/v2/auth");
const logger = require("firebase-functions/logger");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp, getApps } = require("firebase-admin/app");

// Initialize the app if it hasn't been already
if (getApps().length === 0) {
  initializeApp();
}

// Define all possible roles for easy management.
const ALL_ROLES = [
  "dashboard", "orders", "quotes", "users", "purchase-orders",
  "accounting", "analytics", "notifications", "settings", "superadmin",
];

/**
 * Cloud Function that triggers when a new user is created in Firebase Authentication.
 */
exports.onNewUser = onUserCreate(async (event) => {
  const user = event.data; // The user record created
  const { email, uid } = user;

  const userDocRef = getFirestore().collection("users").doc(uid);

  // Read the superadmin email from a secure environment variable
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (superAdminEmail && email === superAdminEmail) {
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
