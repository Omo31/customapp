

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
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    deleteUser,
} from "firebase/auth";
import { doc, serverTimestamp, writeBatch, collection, setDoc } from 'firebase/firestore';
import { useToast } from "./use-toast";
import { useState } from "react";
import { auth, db } from "@/firebase";
import type { UserProfile, Notification } from "@/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useRouter } from "next/navigation";


// This hook is now a wrapper around the core Firebase user state
// to provide login/signup/logout functions with loading states.
export const useAuth = () => {
  const { user, loading: userLoading, roles, hasRole: userHasRole } = useUser();
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const loading = userLoading || actionLoading;

  const saveUserProfile = async (firebaseUser: FirebaseUser, firstName: string, lastName: string) => {
      const userRef = doc(db, 'users', firebaseUser.uid);
      
      try {
        // Create the user profile document. Roles will be handled by the backend function.
        const userProfile: Omit<UserProfile, 'id'> = {
            firstName,
            lastName,
            email: firebaseUser.email || "",
            phoneNumber: "",
            shippingAddress: "",
            roles: [], // Start with no roles. Cloud Function will add admin roles if necessary.
            createdAt: serverTimestamp(),
            notificationPreferences: {
                marketingEmails: false,
                quoteAndOrderUpdates: true,
            }
        };
        
        const batch = writeBatch(db);
        
        // 1. Set the user profile
        batch.set(userRef, userProfile);

        // 2. Create the welcome notification for the user
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
        
        // 3. Create the notification for admins
        const adminNotifRef = doc(collection(db, `notifications`));
        const adminNotif: Omit<Notification, 'id'> = {
            role: 'users',
            title: "New User Joined",
            description: `${firstName} ${lastName} (${firebaseUser.email}) just signed up.`,
            href: `/admin/users/${firebaseUser.uid}`,
            isRead: false,
            createdAt: serverTimestamp(),
        };
        batch.set(adminNotifRef, adminNotif);
        
        // Commit all writes at once
        await batch.commit();

      } catch (error: any) {
         console.error("Error during user profile/notification creation: ", error);
         // This will catch errors from the batch commit
         // We're throwing so the calling signup function can catch it and show a toast
         const permissionError = new FirestorePermissionError({
                path: `users/${firebaseUser.uid}`,
                operation: 'create',
                requestResourceData: 'Multiple Documents (Batch Write)'
         });
         errorEmitter.emit('permission-error', permissionError);
         throw new Error("Failed to initialize user profile. Please check permissions.");
      }
  }

  const login = async (email: string, pass: string) => {
    setActionLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (!userCredential.user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error("Please verify your email before logging in. Check your inbox (and spam folder).");
      }
    } catch (error: any) {
       toast({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const signup = async (email: string, pass: string, firstName: string, lastName: string) => {
    setActionLoading(true);
    let createdUser: FirebaseUser | null = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      createdUser = userCredential.user;

      await updateProfile(createdUser, {
        displayName: `${firstName} ${lastName}`
      });
      
      // CRITICAL: Save profile immediately after creation and before any other async operations.
      // The on-create Cloud Function for role assignment depends on this document existing.
      await saveUserProfile(createdUser, firstName, lastName);
      
      await sendEmailVerification(createdUser);
      
      toast({
          title: "Verification Email Sent",
          description: "Please check your inbox (and spam folder) to verify your email before logging in.",
          duration: 8000,
      });

      // Sign out to force the user to verify their email
      await firebaseSignOut(auth);

    } catch (error: any)       {
       console.error("Signup Error:", error);
       // If the user was created in Auth but something else failed, they might be left in a weird state.
       // However, we don't delete them here because they might have just used an existing email.
       // The error message from Firebase is usually sufficient (e.g., "email-already-in-use").
       toast({
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    setActionLoading(true);
    try {
      await firebaseSignOut(auth);
      router.push('/');
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
      throw error;
    } finally {
      setActionLoading(false);
    }
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setActionLoading(true);
    if (!user || !user.email) {
        toast({ title: "Not Authenticated", description: "You must be logged in to change your password.", variant: "destructive" });
        setActionLoading(false);
        return;
    }
    
    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No user is currently signed in.");

        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);

        toast({ title: "Password Changed", description: "Your password has been updated successfully. Please log in again." });
        
        await firebaseSignOut(auth);
        router.push('/login');

    } catch(error: any) {
        toast({
            title: "Password Change Failed",
            description: error.message || 'An unexpected error occurred.',
            variant: "destructive"
        });
        throw error;
    } finally {
        setActionLoading(false);
    }
  }

  const deleteUserAccount = async (currentPassword: string) => {
    setActionLoading(true);
    if (!user || !user.email) {
        toast({ title: "Not Authenticated", description: "You must be logged in to delete your account.", variant: "destructive" });
        setActionLoading(false);
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No user is currently signed in.");

        await reauthenticateWithCredential(currentUser, credential);
        
        await deleteUser(currentUser);

        toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
        
        router.push('/');

    } catch (error: any) {
         toast({
            title: "Account Deletion Failed",
            description: error.message || 'An unexpected error occurred.',
            variant: "destructive"
        });
        throw error;
    } finally {
        setActionLoading(false);
    }
  }

  const hasRole = (role: string) => {
    // If the user has the 'superadmin' role, they have all permissions.
    if (userHasRole('superadmin')) return true;
    // Otherwise, check for the specific role.
    return userHasRole(role);
  };
  
  const isAdmin = (roles?.length || 0) > 0;

  return { user, loading, login, signup, logout, resetPassword, changePassword, deleteUserAccount, roles, hasRole, isAdmin };
};
