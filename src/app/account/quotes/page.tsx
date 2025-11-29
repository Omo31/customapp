import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">My Quotes</h3>
        <p className="text-sm text-muted-foreground">
          Track the status of your custom order requests.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You have no quotes yet.</p>
        </CardContent>
      </Card>
    </div>
  )
}
