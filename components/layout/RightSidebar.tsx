"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, Users, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RightSidebar() {
  const trendingTopics = [
    {
      tag: "#ReactJS",
      posts: "125K posts",
      trend: "+15%",
      path: "/topics/reactjs",
    },
    {
      tag: "#NextJS",
      posts: "89K posts",
      trend: "+28%",
      path: "/topics/nextjs",
    },
    {
      tag: "#TailwindCSS",
      posts: "67K posts",
      trend: "+12%",
      path: "/topics/tailwindcss",
    },
    {
      tag: "#WebDev",
      posts: "234K posts",
      trend: "+8%",
      path: "/topics/webdev",
    },
    {
      tag: "#TypeScript",
      posts: "156K posts",
      trend: "+22%",
      path: "/topics/typescript",
    },
  ];

  const suggestedUsers = [
    {
      id: 1,
      name: "Sarah Chen",
      username: "sarahcodes",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      followers: "12.3K",
      isFollowing: false,
      path: "/profile/sarahcodes",
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      username: "mikedesigns",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      followers: "8.7K",
      isFollowing: false,
      path: "/profile/mikedesigns",
    },
    {
      id: 3,
      name: "Emma Watson",
      username: "emmawrites",
      avatar:
        "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      followers: "24.1K",
      isFollowing: true,
      path: "/profile/emmawrites",
    },
  ];

  const upcomingEvents = [
    {
      title: "React Conference 2024",
      date: "March 15, 2024",
      attendees: "2.3K",
      path: "/events/react-conference-2024",
    },
    {
      title: "Design Systems Workshop",
      date: "March 22, 2024",
      attendees: "891",
      path: "/events/design-systems-workshop",
    },
  ];

  return (
    <ScrollArea className="h-[calc(100vh-6rem)] mt-20">
      <div className="space-y-6 ">
        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <Link key={topic.tag} href={topic.path}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-200"
                  >
                    <div>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        {topic.tag}
                      </p>
                      <p className="text-sm text-slate-500">{topic.posts}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-green-600 bg-green-50 dark:bg-green-900/20"
                    >
                      {topic.trend}
                    </Badge>
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Suggested Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-purple-500" />
                Who to Follow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3"
                >
                  <Link href={user.path}>
                    <Avatar className="w-10 h-10 ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-purple-500 dark:hover:ring-purple-500 transition-all duration-200">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={user.path}>
                      <p className="font-semibold text-sm truncate hover:text-purple-500 transition-colors duration-200">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        @{user.username} • {user.followers} followers
                      </p>
                    </Link>
                  </div>
                  <Button
                    size="sm"
                    variant={user.isFollowing ? "outline" : "default"}
                    className={cn(
                      "transition-all duration-200",
                      user.isFollowing
                        ? "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-105"
                    )}
                  >
                    {user.isFollowing ? "Following" : "Follow"}
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-green-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <Link key={event.title} href={event.path}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {event.title}
                        </p>
                        <p className="text-sm text-slate-500">{event.date}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-50 dark:bg-green-900/20 text-green-600"
                      >
                        {event.attendees} attending
                      </Badge>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
