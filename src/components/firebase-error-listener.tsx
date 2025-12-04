'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In a development environment, we log the error to the console
      // to avoid crashing the app with the Next.js error overlay.
      if (process.env.NODE_ENV === 'development') {
        console.error("Firestore Permission Error:", error);
      } else {
        // In production, you might want to log this to a service
        // like Sentry, but for now we'll just log it to the console.
        console.error(error);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
