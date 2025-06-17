"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

function NotificationsContent() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <p className="text-slate-600 dark:text-slate-400">
          Your notifications will appear here
        </p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <DashboardLayout
      title="Notifications"
      description="Stay updated with your latest notifications"
    >
      <NotificationsContent />
    </DashboardLayout>
  );
}
