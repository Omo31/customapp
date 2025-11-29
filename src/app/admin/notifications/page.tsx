import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Notifications</h3>
        <p className="text-sm text-muted-foreground">Manage system-wide notifications.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No notifications to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}
