
import AdminDashboard from "@/components/admin/dashboard";
import ProtectedRoute from "@/components/auth/protected-route";

function AdminDashboardContent() {
  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium font-headline">Dashboard</h3>
            <p className="text-sm text-muted-foreground">
                An overview of your store's performance and recent activity.
            </p>
        </div>
        <AdminDashboard />
    </div>
  )
}

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute requiredRole="dashboard">
            <AdminDashboardContent />
        </ProtectedRoute>
    )
}
