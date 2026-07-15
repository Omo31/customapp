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
export const onNewUser = onUserCreate(async (event) => {
  const user = event.data; // The user record created
  if (!user) {
    logger.error("No user data provided in event.");
    return;
  }

  const { email, uid, displayName } = user;
  logger.info(`Processing new user signup: ${email} (UID: ${uid})`);

  const [firstName = "", ...lastNameParts] = displayName?.split(' ') || ["", ""];
  const lastName = lastNameParts.join(' ');

  const userDocRef = getFirestore().collection("users").doc(uid);

  // Read the superadmin email from a secure environment variable
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  const userData: any = {
      email: email || "",
      firstName: firstName || "",
      lastName: lastName || "",
      createdAt: serverTimestamp(),
      disabled: false,
      notificationPreferences: {
        marketingEmails: false,
        quoteAndOrderUpdates: true,
      }
  };

  if (superAdminEmail && email === superAdminEmail) {
    logger.info(`User ${email} matches SUPER_ADMIN_EMAIL. Granting all administrative roles.`);
    userData.roles = ALL_ROLES;
  } else {
    logger.info(`User ${email} registered as a standard customer.`);
    userData.roles = ["customer"];
  }

  try {
    await userDocRef.set(userData, { merge: true });
    logger.info(`Successfully created user profile for UID: ${uid}`);
  } catch (error) {
    logger.error(`Failed to create user profile for UID: ${uid}. Error:`, error);
  }
});
