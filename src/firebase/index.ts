'use client';

import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { app } from './config';

// Export the necessary client-side Firebase instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export hooks and providers
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
