
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewUser = void 0;
const auth_1 = require("firebase-functions/v2/auth");
const logger = require("firebase-functions/logger");
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
// Initialize the app if it hasn't been already
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const SUPER_ADMIN_EMAIL = "oluwagbengwumi@gmail.com";
const ALL_ROLES = [
    "dashboard", "orders", "quotes", "users", "purchase-orders",
    "accounting", "analytics", "notifications", "settings", "superadmin",
];
exports.onNewUser = (0, auth_1.onUserCreate)(async (event) => {
    const user = event.data; // The user record created
    const { email, uid } = user;
    const userDocRef = (0, firestore_1.getFirestore)().collection("users").doc(uid);
    if (email === SUPER_ADMIN_EMAIL) {
        logger.info(`New user ${email} is the designated superadmin. Granting all roles.`);
        try {
            // Use set with merge to safely add roles, avoiding race conditions.
            // This will create the document if it doesn't exist, or update it if it does.
            await userDocRef.set({
                roles: ALL_ROLES,
            }, { merge: true });
            logger.info(`Successfully granted superadmin role to ${uid}`);
        }
        catch (error) {
            logger.error(`Error granting superadmin role to ${uid}. Error:`, error);
        }
    }
    else {
        logger.info(`New user ${email} registered. Assigning default 'customer' role.`);
        try {
            // Use set with merge for consistency and safety.
            await userDocRef.set({
                roles: ["customer"],
            }, { merge: true });
            logger.info(`Successfully assigned 'customer' role to ${uid}`);
        }
        catch (error) {
            logger.error(`Error assigning default role to ${uid}. Error:`, error);
        }
    }
});
