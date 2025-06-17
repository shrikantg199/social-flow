"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

function TopicsContent() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <p className="text-slate-600 dark:text-slate-400">
          Browse topics and categories
        </p>
      </div>
    </div>
  );
}

export default function TopicsPage() {
  return (
    <DashboardLayout title="Topics" description="Explore content by topic">
      <TopicsContent />
    </DashboardLayout>
  );
}
