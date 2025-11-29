import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminQuotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Quotes</h3>
        <p className="text-sm text-muted-foreground">Manage user quotes.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No quotes to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}
