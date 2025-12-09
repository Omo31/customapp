
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User, UserProfile } from '@/types';
import { auth, db } from '..';

interface AuthUserContextValue {
  user: User | null;
  loading: boolean;
  roles: string[];
  hasRole: (role: string) => boolean;
}

const AuthUserContext = createContext<AuthUserContextValue>({
  user: null,
  loading: true,
  roles: [],
  hasRole: () => false,
});

export const AuthUserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userProfile = docSnap.data() as UserProfile;
            const userRoles = userProfile.roles || [];
            const combinedUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              roles: userRoles,
              auth: auth,
            };
            setUser(combinedUser);
            setRoles(userRoles);
          } else {
            // This case might happen briefly during signup before the profile is created.
            // We set a basic user object.
            const basicUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              roles: [],
              auth: auth,
            };
            setUser(basicUser);
            setRoles([]);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            // If profile fails to load, sign out to prevent inconsistent state
            auth.signOut();
            setUser(null);
            setRoles([]);
            setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUser(null);
        setRoles([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const hasRole = (role: string) => {
    return roles.includes(role);
  };

  return (
    <AuthUserContext.Provider value={{ user, loading, roles, hasRole }}>
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
