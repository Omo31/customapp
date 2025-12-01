
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { type Notification, type UserProfile } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BellRing, Check, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useDoc } from "@/firebase/firestore/use-doc";
import { usePagination } from "@/hooks/use-pagination";

const PAGE_SIZE = 10;

const preferencesSchema = z.object({
    marketingEmails: z.boolean().default(false),
    quoteAndOrderUpdates: z.boolean().default(true),
});

export default function NotificationsPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: notifications, loading } = useCollection<Notification>(db, `users/${user?.uid}/notifications`, {
      orderBy: ["createdAt", "desc"],
      limit: PAGE_SIZE,
  });

  const {
    currentPage,
    handleNextPage,
    handlePreviousPage,
    canGoNext,
    canGoPrevious,
    startAfter,
  } = usePagination({ data: notifications, pageSize: PAGE_SIZE });

   const { data: paginatedNotifications, loading: paginatedLoading } = useCollection<Notification>(db, `users/${user?.uid}/notifications`, {
      orderBy: ["createdAt", "desc"],
      limit: PAGE_SIZE,
      startAfter: startAfter,
  });

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(db, 'users', user?.uid);

  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      marketingEmails: false,
      quoteAndOrderUpdates: true,
    }
  });

  useEffect(() => {
    if (userProfile?.notificationPreferences) {
      form.reset(userProfile.notificationPreferences);
    }
  }, [userProfile, form]);


  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    setUpdatingId(notificationId);
    try {
        const notifRef = doc(db, `users/${user.uid}/notifications`, notificationId);
        await updateDoc(notifRef, { isRead: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        toast({
            title: "Error",
            description: "Could not update notification. Please try again.",
            variant: "destructive",
        });
    } finally {
        setUpdatingId(null);
    }
  };

  async function onPreferencesSubmit(values: z.infer<typeof preferencesSchema>) {
    if (!user) return;
    try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            notificationPreferences: values
        });
        toast({
            title: 'Preferences Saved',
            description: 'Your notification settings have been updated.',
        });
        form.reset(values); // This will reset the 'dirty' state of the form
    } catch (error) {
        console.error("Error saving preferences:", error);
        toast({
            title: 'Error',
            description: 'Could not save your preferences. Please try again.',
            variant: 'destructive',
        });
    }
  }

  const currentLoading = loading || paginatedLoading;
  const currentNotifications = currentPage > 1 ? paginatedNotifications : notifications;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          View and manage account-related notifications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>All your notifications are listed below. Unread notifications are marked with a blue dot.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentLoading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!currentLoading && currentNotifications && currentNotifications.length > 0 && (
            <div className="space-y-1">
              {currentNotifications.map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                     {!notif.isRead && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                     {notif.isRead && <div className="h-2.5 w-2.5 rounded-full bg-transparent" />}
                    <div className="grid gap-1">
                      <p className="font-semibold">{notif.title}</p>
                      <p className="text-sm text-muted-foreground">{notif.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {notif.href && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={notif.href}>View</Link>
                        </Button>
                      )}
                      {!notif.isRead && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notif.id!)} disabled={updatingId === notif.id}>
                              {updatingId === notif.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                               Mark as read
                          </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!currentLoading && (!currentNotifications || currentNotifications.length === 0) && (
             <div className="text-center py-12">
                <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No New Notifications</h3>
                <p className="mt-2 text-sm text-muted-foreground">You're all caught up! Check back later.</p>
            </div>
          )}
        </CardContent>
        {currentNotifications && currentNotifications.length > 0 && (
            <CardFooter>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={handlePreviousPage} aria-disabled={!canGoPrevious} className={!canGoPrevious ? "pointer-events-none opacity-50" : undefined} />
                        </PaginationItem>
                        <PaginationItem>
                        <span className="p-2 text-sm">Page {currentPage}</span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext onClick={handleNextPage} aria-disabled={!canGoNext} className={!canGoNext ? "pointer-events-none opacity-50" : undefined} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </CardFooter>
        )}
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onPreferencesSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {profileLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                     ) : (
                        <>
                            <FormField
                                control={form.control}
                                name="marketingEmails"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="marketing-emails" className="text-base">
                                                Marketing Emails
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive emails about new products, special offers, and more.
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                id="marketing-emails"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quoteAndOrderUpdates"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="quote-updates" className="text-base">
                                                Quote & Order Updates
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive email notifications for status changes on your quotes and orders.
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                id="quote-updates"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </>
                     )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Preferences
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form>
    </div>
  )
}
