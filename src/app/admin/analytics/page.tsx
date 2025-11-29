import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Analytics</h3>
        <p className="text-sm text-muted-foreground">View detailed analytics and reports on store performance.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No analytics data to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}
