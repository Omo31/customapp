

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
import { doc, serverTimestamp, writeBatch, collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { useToast } from "./use-toast";
import { useState } from "react";
import { auth, db } from "@/firebase";
import type { UserProfile, Notification } from "@/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { allAdminRoles } from "@/lib/roles";
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
    const userProfileBatch = writeBatch(db);
    const userRef = doc(db, 'users', firebaseUser.uid);
    
    // Check if this is the very first user signing up
    const usersQuery = query(collection(db, "users"), limit(1));
    const usersSnapshot = await getDocs(usersQuery);
    const isFirstUser = usersSnapshot.empty;
    const isSuperAdminByEmail = firebaseUser.email === "oluwagbengwumi@gmail.com";

    const userProfile: Omit<UserProfile, 'id'> = {
      firstName,
      lastName,
      email: firebaseUser.email || "",
      phoneNumber: "",
      shippingAddress: "",
      roles: isFirstUser || isSuperAdminByEmail ? ["superadmin", ...allAdminRoles.filter(r => r !== 'superadmin')] : [],
      createdAt: serverTimestamp(),
      notificationPreferences: {
        marketingEmails: false,
        quoteAndOrderUpdates: true,
      }
    };

    userProfileBatch.set(userRef, userProfile, { merge: true });

    const userNotifRef = doc(collection(db, `users/${firebaseUser.uid}/notifications`));
    const userNotif: Omit<Notification, 'id'> = {
        userId: firebaseUser.uid,
        title: "Welcome to BeautifulSoup&Foods!",
        description: "We're so glad to have you. Explore our products and start shopping.",
        href: "/",
        isRead: false,
        createdAt: serverTimestamp(),
    };
    userProfileBatch.set(userNotifRef, userNotif);
    
    await userProfileBatch.commit();
    
    const adminNotifRef = collection(db, `notifications`);
    const adminNotif: Omit<Notification, 'id'> = {
        role: 'users',
        title: "New User Joined",
        description: `${firstName} ${lastName} (${firebaseUser.email}) just signed up.`,
        href: `/admin/users/${firebaseUser.uid}`,
        isRead: false,
        createdAt: serverTimestamp(),
    };
    
    await addDoc(adminNotifRef, adminNotif).catch(error => {
        console.error("Failed to create admin notification:", error);
         const permissionError = new FirestorePermissionError({
            path: `notifications`,
            operation: 'create',
            requestResourceData: adminNotif
        });
        errorEmitter.emit('permission-error', permissionError);
    });
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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });
      
      await saveUserProfile(userCredential.user, firstName, lastName);
      await sendEmailVerification(userCredential.user);
      
      toast({
          title: "Verification Email Sent",
          description: "Please check your inbox (and spam folder) to verify your email before logging in.",
          duration: 8000,
      });

      await firebaseSignOut(auth);

    } catch (error: any)       {
       console.error("Signup Error:", error);
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
