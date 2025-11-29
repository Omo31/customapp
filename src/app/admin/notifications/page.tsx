"use client"

import { useFirestore, useCollectionGroup } from "@/firebase";
import { Notification } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotificationsPage() {
  const db = useFirestore();
  // Using collectionGroup to get notifications from all users
  const { data: notifications, loading } = useCollectionGroup<Notification>(db, `notifications`, {
      orderBy: ["createdAt", "desc"],
      limit: 50 // To avoid fetching too many documents at once
  });

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
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>A live feed of all user notifications.</CardDescription>
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
              {notifications.map((notif, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{notif.title}</p>
                    <p className="text-sm text-muted-foreground">{notif.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      User: ...{notif.userId.slice(-6)} | {new Date(notif.createdAt?.seconds * 1000).toLocaleString()}
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
            <p className="text-muted-foreground">No notifications to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
