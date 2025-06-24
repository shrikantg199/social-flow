"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function DashboardLayout({
  children,
  title,
  description,
}: DashboardLayoutProps) {
  const { user, isLoaded } = useUser();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    // Try to fetch by clerkId first, then by email if not found
    fetch(`/api/users?clerkId=${user.id}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCurrentUser(data[0]);
          setLoading(false);
        } else if (data.user) {
          setCurrentUser(data.user);
          setLoading(false);
        } else {
          // Try to fetch by email if not found by clerkId
          fetch(
            `/api/users?email=${encodeURIComponent(user.emailAddresses[0]?.emailAddress || "")}`
          )
            .then((res) => res.json())
            .then(async (emailData) => {
              if (Array.isArray(emailData) && emailData.length > 0) {
                setCurrentUser(emailData[0]);
                setLoading(false);
              } else if (emailData.user) {
                setCurrentUser(emailData.user);
                setLoading(false);
              } else {
                // User not found, create in DB
                const createRes = await fetch("/api/users", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: user.fullName || user.firstName || "User",
                    username:
                      user.username ||
                      (user.emailAddresses &&
                      user.emailAddresses[0]?.emailAddress
                        ? user.emailAddresses[0].emailAddress.split("@")[0]
                        : "user"),
                    email:
                      user.emailAddresses &&
                      user.emailAddresses[0]?.emailAddress
                        ? user.emailAddresses[0].emailAddress
                        : "",
                    profilePicture: user.imageUrl || "",
                  }),
                });
                const created = await createRes.json();
                setCurrentUser(created.user || created);
                setLoading(false);
              }
            })
            .catch(async () => {
              // User not found, create in DB
              const createRes = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: user.fullName || user.firstName || "User",
                  username:
                    user.username ||
                    (user.emailAddresses && user.emailAddresses[0]?.emailAddress
                      ? user.emailAddresses[0].emailAddress.split("@")[0]
                      : "user"),
                  email:
                    user.emailAddresses && user.emailAddresses[0]?.emailAddress
                      ? user.emailAddresses[0].emailAddress
                      : "",
                  profilePicture: user.imageUrl || "",
                }),
              });
              const created = await createRes.json();
              setCurrentUser(created.user || created);
              setLoading(false);
            });
        }
      })
      .catch(() => {
        setCurrentUser({
          _id: undefined,
          name: user.fullName || user.firstName || "User",
          username:
            user.username ||
            (user.emailAddresses && user.emailAddresses[0]?.emailAddress
              ? user.emailAddresses[0].emailAddress.split("@")[0]
              : "user"),
          profilePicture: user.imageUrl || "",
          verified: false,
        });
        setLoading(false);
      });
  }, [isLoaded, user]);

  if (!isLoaded || !user || loading || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex">
        <Sidebar
          currentUser={currentUser}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 lg:ml-64">
          <Header
            currentUser={currentUser}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />

          <div className="px-6 py-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-slate-600 dark:text-slate-400">
                {description}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">{children}</div>
              <div className="hidden lg:block">
                <RightSidebar currentUserId={currentUser._id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
