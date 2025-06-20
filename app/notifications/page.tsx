"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNotificationsStore, Notification } from "@/lib/store/notifications";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "like":
      return <Heart className="w-5 h-5 text-red-500" />;
    case "comment":
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case "follow":
      return <UserPlus className="w-5 h-5 text-green-500" />;
    case "mention":
      return <AtSign className="w-5 h-5 text-purple-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
}

function NotificationsContent() {
  const { notifications, markAsRead, markAllAsRead } = useNotificationsStore();

  if (notifications.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">
            No notifications yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          className="text-sm"
        >
          Mark all as read
        </Button>
      </div>
      <div className="space-y-2">
        {notifications.map((notification: Notification) => (
          <div
            key={notification.id}
            className={cn(
              "bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm transition-colors duration-200",
              !notification.read && "bg-blue-50 dark:bg-blue-900/20"
            )}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <NotificationIcon type={notification.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {notification.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {notification.message}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {formatDistanceToNow(notification.createdAt, {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
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
