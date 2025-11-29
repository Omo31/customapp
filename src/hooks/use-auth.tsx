
"use client";
import { useUser } from "@/firebase";
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from "./use-toast";
import { useState } from "react";
import { auth, db } from "@/firebase";
import type { UserProfile } from "@/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

// This hook is now a wrapper around the core Firebase user state
// to provide login/signup/logout functions with loading states.
export const useAuth = () => {
  const { user, loading: userLoading, isAdmin } = useUser();
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const loading = userLoading || actionLoading;

  const saveUserProfile = (firebaseUser: FirebaseUser, firstName: string, lastName: string) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userProfile: UserProfile = {
      firstName,
      lastName,
      email: firebaseUser.email || "",
      // Set isAdmin to true if the email matches the superadmin email
      isAdmin: firebaseUser.email === "oluwagbengwumi@gmail.com",
    };

    setDoc(userRef, userProfile, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userProfile
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

  const login = async (email: string, pass: string) => {
    setActionLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
       toast({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      // Re-throw to be caught by the form
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const signup = async (email: string, pass: string, firstName: string, lastName: string) => {
    setActionLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });
      // Create the user profile document in Firestore
      saveUserProfile(userCredential.user, firstName, lastName);
    } catch (error: any)       {
       toast({
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      // Re-throw to be caught by the form
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    setActionLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
       toast({
        title: 'Logout Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return { user, loading, login, signup, logout, isAdmin };
};
