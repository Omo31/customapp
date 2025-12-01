"use client"

import AdminDashboard from "@/components/admin/dashboard";
import ProtectedRoute from "@/components/auth/protected-route";

function AdminAnalyticsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Analytics</h3>
        <p className="text-sm text-muted-foreground">
          A real-time overview of your store's performance and recent activity.
        </p>
      </div>
      <AdminDashboard />
    </div>
  )
}

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute requiredRole="analytics">
      <AdminAnalyticsContent />
    </ProtectedRoute>
  )
}
