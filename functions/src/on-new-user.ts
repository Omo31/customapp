/**
 * @fileoverview
 * This file contains a Cloud Function that triggers on new user creation.
 * It assigns a 'superadmin' role if the user's email matches a specific
 * environment variable, otherwise it assigns a default 'customer' role.
 */

import { auth, EventContext } from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { UserRecord } from "firebase-functions/v1/auth";

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
export const onNewUser = auth.user().onCreate(async (user: UserRecord, context: EventContext) => {
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
