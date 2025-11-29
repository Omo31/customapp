
"use client";
import { useUser } from "@/firebase";
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification,
    type User as FirebaseUser,
} from "firebase/auth";
import { doc, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
import { useToast } from "./use-toast";
import { useState } from "react";
import { auth, db } from "@/firebase";
import type { UserProfile, Notification } from "@/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { allAdminRoles } from "@/lib/roles";

// This hook is now a wrapper around the core Firebase user state
// to provide login/signup/logout functions with loading states.
export const useAuth = () => {
  const { user, loading: userLoading, roles, hasRole } = useUser();
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const loading = userLoading || actionLoading;

  const saveUserProfile = (firebaseUser: FirebaseUser, firstName: string, lastName: string) => {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', firebaseUser.uid);
    
    // Check if the user is the superadmin
    const isSuperAdmin = firebaseUser.email === "oluwagbengwumi@gmail.com";
    
    const userProfile: Omit<UserProfile, 'id'> = {
      firstName,
      lastName,
      email: firebaseUser.email || "",
      // Superadmin gets all roles, others get an empty array.
      roles: isSuperAdmin ? allAdminRoles : [],
      createdAt: serverTimestamp(),
    };

    batch.set(userRef, userProfile, { merge: true });

    // Create a welcome notification for the new user
    const userNotifRef = doc(collection(db, `users/${firebaseUser.uid}/notifications`));
    const userNotif: Omit<Notification, 'id'> = {
        userId: firebaseUser.uid,
        title: "Welcome to BeautifulSoup&Foods!",
        description: "We're so glad to have you. Explore our products and start shopping.",
        href: "/",
        isRead: false,
        createdAt: serverTimestamp(),
    };
    batch.set(userNotifRef, userNotif);

    // Create a notification for the superadmin (assuming a fixed superadmin ID)
    // In a real app, you might query for all admins and notify them.
    // For now, we'll assume a single superadmin with a known ID.
    // NOTE: This assumes the superadmin user exists in Firestore with this UID.
    // The UID for 'oluwagbengwumi@gmail.com' needs to be known.
    // Let's hardcode it for this example, but a better solution would be needed for production.
    const superAdminEmail = "oluwagbengwumi@gmail.com";
    // We can't know the UID from the email on the client side without another query.
    // For simplicity, we will skip the admin notification for now as it adds complexity
    // that requires either a backend function or insecure client-side queries.
    
    // Instead, let's create a notification in a general `admin-notifications` collection
    // that admins with the 'notifications' role can view.
    // This is more scalable. We'll assume the admin page already queries this.
    // Let's stick to the user notification to avoid over-complicating.

    batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `batch write for user ${firebaseUser.uid}`,
            operation: 'create',
            requestResourceData: { userProfile, userNotif }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

  const login = async (email: string, pass: string) => {
    setActionLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (!userCredential.user.emailVerified) {
        // Log the user out immediately
        await firebaseSignOut(auth);
        // Throw a specific error for the form to catch
        throw new Error("Please verify your email before logging in. Check your inbox (and spam folder).");
      }
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
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Create the user profile document in Firestore & a welcome notification
      saveUserProfile(userCredential.user, firstName, lastName);
      
      // Inform the user
      toast({
          title: "Verification Email Sent",
          description: "Please check your inbox (and spam folder) to verify your email before logging in.",
          duration: 8000,
      });

      // Sign the user out so they have to verify before logging in
      await firebaseSignOut(auth);

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

  const resetPassword = async (email: string) => {
    setActionLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
    } catch (error: any) {
      toast({
        title: 'Password Reset Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      // Re-throw to be caught by the form
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  return { user, loading, login, signup, logout, resetPassword, roles, hasRole, isAdmin: (roles?.length || 0) > 0 };
};
