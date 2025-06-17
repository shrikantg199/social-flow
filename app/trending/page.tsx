"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

function TrendingContent() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <p className="text-slate-600 dark:text-slate-400">
          Trending topics and posts will appear here
        </p>
      </div>
    </div>
  );
}

export default function TrendingPage() {
  return (
    <DashboardLayout
      title="Trending"
      description="See what's popular right now"
    >
      <TrendingContent />
    </DashboardLayout>
  );
}
