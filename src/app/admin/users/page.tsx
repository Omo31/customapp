import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Users</h3>
        <p className="text-sm text-muted-foreground">Manage application users.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No users to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}
