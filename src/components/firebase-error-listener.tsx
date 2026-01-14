
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In a development environment, we use console.group to make the error
      // more readable and to include the full error object for debugging.
      if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed("%cFirestore Permission Error", "color: red; font-weight: bold;");
        console.error(error.message);
        console.log("Full error object:", error);
        console.groupEnd();
      } else {
        // In production, you might want to log this to a service
        // like Sentry, but for now we'll just log the message.
        console.error(error.message);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
