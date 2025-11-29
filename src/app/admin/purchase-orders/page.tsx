import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Purchase Orders</h3>
        <p className="text-sm text-muted-foreground">Create and track orders placed with your suppliers.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No purchase orders to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}
