
"use client"

import AdminDashboard from "@/components/admin/dashboard";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Analytics</h3>
        <p className="text-sm text-muted-foreground">View detailed analytics and reports on store performance.</p>
      </div>
      <AdminDashboard />
    </div>
  )
}
