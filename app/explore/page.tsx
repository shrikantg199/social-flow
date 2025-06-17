"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

function ExploreContent() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <p className="text-slate-600 dark:text-slate-400">
          Explore content will appear here
        </p>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <DashboardLayout
      title="Explore"
      description="Discover new content and trends"
    >
      <ExploreContent />
    </DashboardLayout>
  );
}
