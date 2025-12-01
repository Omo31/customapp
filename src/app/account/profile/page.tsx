
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth.tsx"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useFirestore } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useDoc } from "@/firebase/firestore/use-doc"
import { UserProfile } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email(),
})

const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
});


export default function ProfilePage() {
  const { user: authUser, loading: authLoading, changePassword, deleteUserAccount } = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const {data: userProfile, loading: profileLoading} = useDoc<UserProfile>(db, "users", authUser?.uid)

  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);


  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    },
  });
  
  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
      })
    }
  }, [userProfile, profileForm])

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!authUser) return;

    try {
        const userRef = doc(db, "users", authUser.uid);
        await updateDoc(userRef, {
            firstName: values.firstName,
            lastName: values.lastName,
        });

        if (authUser.auth && authUser.auth.currentUser) {
            await updateProfile(authUser.auth.currentUser, { 
                displayName: `${values.firstName} ${values.lastName}`
            })
        }

        toast({
            title: "Profile Updated",
            description: "Your profile information has been successfully updated.",
        });
        profileForm.reset(values);
    } catch (error: any) {
        console.error("Error updating profile: ", error);
        toast({
            title: "Error",
            description: "Failed to update profile. Please try again.",
            variant: "destructive",
        });
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    await changePassword(values.currentPassword, values.newPassword);
    passwordForm.reset();
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
        toast({ title: "Password required", description: "Please enter your password to confirm deletion.", variant: "destructive" });
        return;
    }
    setIsDeleting(true);
    try {
        await deleteUserAccount(deletePassword);
        // On success, the useAuth hook will redirect the user. No need to do anything here.
    } catch (error) {
        // Error toast is handled by the hook
    } finally {
        setIsDeleting(false);
        setDeletePassword("");
    }
  }
  
  const isLoading = authLoading || profileLoading;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

       <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <Card>
                <CardHeader className="items-center">
                  {isLoading ? (
                    <Skeleton className="h-24 w-24 rounded-full" />
                  ) : (
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={authUser?.photoURL ?? undefined} alt="User avatar" data-ai-hint="person face" />
                      <AvatarFallback>
                        {userProfile?.firstName?.[0]}
                        {userProfile?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <CardTitle>{userProfile?.firstName} {userProfile?.lastName}</CardTitle>
                  <CardDescription>Update your personal details below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                 {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                 ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={profileForm.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} autoComplete="given-name" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={profileForm.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} autoComplete="family-name" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} disabled autoComplete="email" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                 )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty || isLoading}>
                        {profileForm.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form>

       <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password. You will be logged out after a successful change.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} autoComplete="current-password" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} autoComplete="new-password" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} autoComplete="new-password" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting || !passwordForm.formState.isDirty}>
                        {passwordForm.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            'Save Password'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form>

      <Card className="border-destructive">
          <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>Permanently delete your account and all associated data. This action is irreversible.</CardDescription>
          </CardHeader>
          <CardFooter>
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete My Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers. Please enter your password to confirm.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <FormLabel htmlFor="delete-confirm-password">Password</FormLabel>
                        <Input 
                            id="delete-confirm-password"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Deletion
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
          </CardFooter>
      </Card>

    </div>
  )
}
