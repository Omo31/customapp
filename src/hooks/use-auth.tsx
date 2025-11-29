"use client";
import { useUser } from "@/firebase";
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    getAuth
} from "firebase/auth";
import { useToast } from "./use-toast";
import { useState } from "react";
import { app } from "@/firebase/config";

// This hook is now a wrapper around the core Firebase user state
// to provide login/signup/logout functions with loading states.
export const useAuth = () => {
  const { user, loading: userLoading, isAdmin } = useUser();
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const auth = getAuth(app);

  const loading = userLoading || actionLoading;

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
      // You might want to create a user profile document in Firestore here as well
    } catch (error: any) {
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
