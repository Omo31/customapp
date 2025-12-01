
"use client"

import { useFirestore, useCollectionGroup } from "@/firebase";
import { Notification } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BellRing } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import ProtectedRoute from "@/components/auth/protected-route";

const PAGE_SIZE = 20;

function AdminNotificationsContent() {
  const db = useFirestore();

  const { data: initialData, loading: initialLoading } = useCollectionGroup<Notification>(db, 'notifications', {
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

  const { data: notifications, loading: paginatedLoading } = useCollectionGroup<Notification>(db, `notifications`, {
      orderBy: ["createdAt", "desc"],
      limit: PAGE_SIZE,
      startAfter: startAfter
  });
  
  const loading = initialLoading || paginatedLoading;
  const currentNotifications = currentPage > 1 ? notifications : initialData;


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          View all notifications from across the system.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All System Notifications</CardTitle>
          <CardDescription>A live feed of all user notifications. Unread notifications are marked with a blue dot.</CardDescription>
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
              {currentNotifications.map((notif, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                     {!notif.isRead && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                     {notif.isRead && <div className="h-2.5 w-2.5 rounded-full bg-transparent" />}
                     <div className="grid gap-1">
                        <p className="font-semibold">{notif.title}</p>
                        <p className="text-sm text-muted-foreground">{notif.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                        User: ...{notif.userId.slice(-6)} | {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                        </p>
                    </div>
                  </div>
                  {notif.href && (
                    <Button asChild variant="outline" size="sm">
                        <Link href={notif.href}>View</Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          {!loading && (!currentNotifications || currentNotifications.length === 0) && (
            <div className="text-center py-12">
                <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Notifications</h3>
                <p className="mt-2 text-sm text-muted-foreground">The system hasn't generated any notifications yet.</p>
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
