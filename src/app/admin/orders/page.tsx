import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Orders</h3>
        <p className="text-sm text-muted-foreground">Manage customer orders.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No orders to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}
