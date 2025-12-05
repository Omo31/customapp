

"use client"

import { useFirestore, useCollection } from "@/firebase";
import { Notification } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BellRing, Check, Loader2 } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { useMemo, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

function AdminNotificationsContent() {
  const db = useFirestore();
  const { roles } = useAuth();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Memoize the array for the 'in' query
  // Firestore 'in' queries cannot be empty. Provide a dummy value if roles array is empty.
  const userRoles = useMemo(() => {
    return roles && roles.length > 0 ? roles : [''];
  }, [roles]);

  const { data: initialData, loading: initialLoading } = useCollection<Notification>(db, 'notifications', {
    where: ['role', 'in', userRoles],
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
  } = usePagination({ data: initialData, pageSize: PAGE_SIZE });

  const { data: notifications, loading: paginatedLoading } = useCollection<Notification>(db, `notifications`, {
      where: ['role', 'in', userRoles],
      orderBy: ["createdAt", "desc"],
      limit: PAGE_SIZE,
      startAfter: startAfter
  });
  
  const loading = initialLoading || paginatedLoading;
  const currentNotifications = currentPage > 1 ? notifications : initialData;

  const handleMarkAsRead = async (notificationId: string) => {
    if (!notificationId) return;
    setUpdatingId(notificationId);
    try {
        const notifRef = doc(db, `notifications`, notificationId);
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


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          View all notifications relevant to your assigned roles.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Notifications</CardTitle>
          <CardDescription>A live feed of all notifications for your roles. Unread notifications are marked with a blue dot.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
             <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
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
          {!loading && currentNotifications && currentNotifications.length > 0 && (
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
                        Role: {notif.role} | {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
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
          {!loading && (!currentNotifications || currentNotifications.length === 0) && (
            <div className="text-center py-12">
                <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Notifications</h3>
                <p className="mt-2 text-sm text-muted-foreground">There are no notifications for your assigned roles.</p>
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
    </div>
  )
}

export default function AdminNotificationsPage() {
    return (
        <ProtectedRoute requiredRole="notifications">
            <AdminNotificationsContent />
        </ProtectedRoute>
    )
}
