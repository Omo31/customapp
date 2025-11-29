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

const PAGE_SIZE = 10;

export default function NotificationsPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot<DocumentData> | null)[]>([null]);

  const { data: notifications, loading, lastDoc } = useCollection<Notification>(db, `users/${user?.uid}/notifications`, {
      orderBy: ["createdAt", "desc"],
      limit: PAGE_SIZE,
      startAfter: pageHistory[currentPage - 1],
  });

  const handleNextPage = () => {
    if (lastDoc) {
      const newHistory = [...pageHistory, lastDoc];
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

  const canGoNext = notifications && notifications.length === PAGE_SIZE;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          View all account-related notifications.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>All your notifications are listed below.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-4">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {!loading && notifications && notifications.length > 0 && (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{notif.title}</p>
                    <p className="text-sm text-muted-foreground">{notif.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                    </p>
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
          {!loading && (!notifications || notifications.length === 0) && (
            <p className="text-muted-foreground">You have no new notifications.</p>
          )}
        </CardContent>
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
      </Card>
    </div>
  )
}
