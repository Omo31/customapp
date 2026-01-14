/**
 * @fileoverview
 * This file contains a Cloud Function that triggers on user account deletion.
 * It removes the corresponding user's document from the 'users' collection in Firestore.
 */

import { onUserDelete, UserRecord } from "firebase-functions/v2/auth";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

// Initialize the app if it hasn't been already
if (getApps().length === 0) {
  initializeApp();
}

/**
 * Cloud Function that triggers when a user account is deleted from Firebase Authentication.
 */
export const onDeleteUser = onUserDelete(async (event: { data: UserRecord }) => {
  const user = event.data;
  const { uid, email } = user;

  logger.info(`User account deleted: ${email} (UID: ${uid}). Preparing to delete Firestore document.`);

  const userDocRef = getFirestore().collection("users").doc(uid);

  try {
    await userDocRef.delete();
    logger.info(`Successfully deleted Firestore document for user ${uid}.`);
  } catch (error) {
    logger.error(`Error deleting Firestore document for user ${uid}:`, error);
  }
});
