
"use client"

import { useFirestore, useCollection } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { type Notification } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BellRing, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PAGE_SIZE = 10;

export default function NotificationsPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot<DocumentData> | null)[]>([null]);

  const { data: notifications, loading } = useCollection<Notification>(db, `users/${user?.uid}/notifications`, {
      orderBy: ["createdAt", "desc"],
      limit: PAGE_SIZE,
      startAfter: pageHistory[currentPage - 1],
  });
  
  const { data: allNotifications } = useCollection<Notification>(db, `users/${user?.uid}/notifications`, {
      orderBy: ["createdAt", "desc"],
  });


  const handleNextPage = () => {
    if (allNotifications && (currentPage * PAGE_SIZE < allNotifications.length)) {
      const newHistory = [...pageHistory, allNotifications[currentPage*PAGE_SIZE -1].doc as DocumentSnapshot<DocumentData>];
      setPageHistory(newHistory);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setPageHistory(pageHistory.slice(0, -1));
      setCurrentPage(currentPage - 1);
    }
  };

  const canGoNext = allNotifications && (currentPage * PAGE_SIZE < allNotifications.length);


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
          {loading && (
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
          {!loading && notifications && notifications.length > 0 && (
            <div className="space-y-1">
              {notifications.map((notif) => (
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
                          <Button variant="ghost" size="sm" >
                              <Check className="h-4 w-4 mr-1" /> Mark as read
                          </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && (!notifications || notifications.length === 0) && (
             <div className="text-center py-12">
                <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No New Notifications</h3>
                <p className="mt-2 text-sm text-muted-foreground">You're all caught up! Check back later.</p>
            </div>
          )}
        </CardContent>
        {notifications && notifications.length > 0 && (
            <CardFooter>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={handlePreviousPage} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined} />
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

      <Card>
          <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails" className="text-base">
                          Marketing Emails
                      </Label>
                      <p className="text-sm text-muted-foreground">
                          Receive emails about new products, special offers, and more.
                      </p>
                  </div>
                  <Switch id="marketing-emails" disabled />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                      <Label htmlFor="quote-updates" className="text-base">
                          Quote & Order Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                          Receive email notifications for status changes on your quotes and orders.
                      </p>
                  </div>
                  <Switch id="quote-updates" defaultChecked disabled />
              </div>
          </CardContent>
          <CardFooter>
            <Button disabled>Save Preferences</Button>
            <p className="text-xs text-muted-foreground ml-4">Preference management coming soon.</p>
          </CardFooter>
      </Card>

    </div>
  )
}
