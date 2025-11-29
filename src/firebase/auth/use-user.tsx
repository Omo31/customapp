'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, Firestore } from 'firebase/firestore';
import { useFirebase } from '../provider';
import type { User, UserProfile } from '@/types';
import { auth, db } from '..';

interface AuthUserContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthUserContext = createContext<AuthUserContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const AuthUserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, now listen to their profile document
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userProfile = docSnap.data() as UserProfile;
            const combinedUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              isAdmin: userProfile.isAdmin || false,
            };
            setUser(combinedUser);
            setIsAdmin(userProfile.isAdmin || false);
          } else {
             // Profile doesn't exist yet, create a basic user object
             // This can happen during sign up
            const basicUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                isAdmin: false,
            };
            setUser(basicUser);
            setIsAdmin(false);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setUser(null);
            setLoading(false);
        });
        return () => unsubProfile();
      } else {
        // User is signed out
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthUserContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthUserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthUserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthUserProvider');
  }
  return context;
};
