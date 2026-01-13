/**
 * This file is the main entry point for your Cloud Functions.
 * You can export multiple functions from this file.
 */

// Import and re-export the onNewUser function
const { onNewUser } = require('./on-new-user');

exports.onNewUser = onNewUser;
