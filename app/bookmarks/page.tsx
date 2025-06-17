"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

function BookmarksContent() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <p className="text-slate-600 dark:text-slate-400">
          Your bookmarked posts will appear here
        </p>
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <DashboardLayout title="Bookmarks" description="Access your saved content">
      <BookmarksContent />
    </DashboardLayout>
  );
}
