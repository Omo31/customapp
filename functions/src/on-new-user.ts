/**
 * @fileoverview
 * This file contains a Cloud Function that triggers on new user creation.
 * It assigns a 'superadmin' role if the user's email matches a specific
 * environment variable, otherwise it assigns a default 'customer' role.
 * It also populates the user's Firestore document with initial data.
 */

import { onUserCreate } from "firebase-functions/v2/auth";
import * as logger from "firebase-functions/logger";
import { getFirestore, serverTimestamp } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { UserRecord } from "firebase-admin/auth";

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
export const onNewUser = onUserCreate(async (event: { data: UserRecord }) => {
  const user = event.data; // The user record created
  const { email, uid, displayName } = user;
  const [firstName, ...lastNameParts] = displayName?.split(' ') || ["", ""];
  const lastName = lastNameParts.join(' ');


  const userDocRef = getFirestore().collection("users").doc(uid);

  // Read the superadmin email from a secure environment variable
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  const userData: any = {
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      createdAt: serverTimestamp(),
      notificationPreferences: {
        marketingEmails: false,
        quoteAndOrderUpdates: true,
      }
  };

  if (superAdminEmail && email === superAdminEmail) {
    logger.info(`New user ${email} is the designated superadmin. Granting all roles.`);
    userData.roles = ALL_ROLES;
  } else {
    logger.info(`New user ${email} registered. Assigning default 'customer' role.`);
    userData.roles = ["customer"];
  }

  try {
    await userDocRef.set(userData, { merge: true });
    logger.info(`Successfully created user profile and assigned roles for ${uid}`);
  } catch (error) {
    logger.error(`Error creating user profile for ${uid}. Error:`, error);
  }
});
