import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminAccountingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Accounting</h3>
        <p className="text-sm text-muted-foreground">Manage financial data.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No accounting data to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}
