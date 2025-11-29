import AdminDashboard from "@/components/admin/dashboard";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Dashboard</h3>
        <p className="text-sm text-muted-foreground">
          An overview of key metrics and recent activity.
        </p>
      </div>
      <AdminDashboard />
    </div>
  )
}
