"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

function MessagesContent() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <p className="text-slate-600 dark:text-slate-400">
          Your messages will appear here
        </p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <DashboardLayout title="Messages" description="Chat with your connections">
      <MessagesContent />
    </DashboardLayout>
  );
}
