
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
import { useAuth } from "@/hooks/use-auth"
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
import { useEffect } from "react"
import { useDoc } from "@/firebase/firestore/use-doc"
import { UserProfile } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email(),
})

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const {data: userProfile, loading: profileLoading} = useDoc<UserProfile>(db, "users", authUser?.uid)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  })
  
  const { isSubmitting, isDirty } = form.formState;

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
      })
    }
  }, [userProfile, form])

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!authUser) return;

    try {
        const userRef = doc(db, "users", authUser.uid);
        await updateDoc(userRef, {
            firstName: values.firstName,
            lastName: values.lastName,
        });

        if (authUser.auth) { // useAuth from provider returns auth instance now
            await updateProfile(authUser.auth.currentUser, { // so we use authUser.auth.currentUser
                displayName: `${values.firstName} ${values.lastName}`
            })
        }

        toast({
            title: "Profile Updated",
            description: "Your profile information has been successfully updated.",
        });
        form.reset(values);
    } catch (error: any) {
        console.error("Error updating profile: ", error);
        toast({
            title: "Error",
            description: "Failed to update profile. Please try again.",
            variant: "destructive",
        });
    }
  }
  
  const isLoading = authLoading || profileLoading;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal information.
        </p>
      </div>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account details here.</CardDescription>
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
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} disabled />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                 )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting || !isDirty || isLoading}>
                        {isSubmitting ? (
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
    </div>
  )
}
