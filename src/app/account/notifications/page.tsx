"use client"

import { useFirestore, useCollection } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { type Notification } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const { data: notifications, loading } = useCollection<Notification>(db, `users/${user?.uid}/notifications`, {
      orderBy: ["createdAt", "desc"],
  });

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
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
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
                      {new Date(notif.createdAt?.seconds * 1000).toLocaleString()}
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
      </Card>
    </div>
  )
}
