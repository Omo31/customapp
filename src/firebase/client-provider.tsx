'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { AuthUserProvider } from './auth/use-user';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FirebaseProvider>
        <AuthUserProvider>
            {children}
            <FirebaseErrorListener />
        </AuthUserProvider>
    </FirebaseProvider>
  );
};
