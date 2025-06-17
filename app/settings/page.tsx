"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

function SettingsContent() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <p className="text-slate-600 dark:text-slate-400">
          Your account settings will appear here
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <DashboardLayout
      title="Settings"
      description="Manage your account preferences"
    >
      <SettingsContent />
    </DashboardLayout>
  );
}
