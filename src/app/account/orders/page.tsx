import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Order History</h3>
        <p className="text-sm text-muted-foreground">
          View your past orders and their statuses.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You have no orders yet.</p>
        </CardContent>
      </Card>
    </div>
  )
}
