"use client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowRight, Users, Star, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      router.replace("/feed");
    }
  }, [userId, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 bg-[length:400%_400%]" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/90 rounded-3xl shadow-2xl px-10 py-12 max-w-md w-full flex flex-col items-center"
      >
        {/* Improved Logo Area */}
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 8,
            delay: 0.2,
          }}
          className="mb-6 text-6xl drop-shadow-lg flex items-center justify-center"
        >
          <motion.div
            className="mr-2"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          >
            <Image
              src="/assets/logo.png"
              alt="SocialFlow Logo"
              width={100}
              height={100}
            />
          </motion.div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-800 via-blue-700 to-orange-500 bg-clip-text text-transparent">
            SocialFlow
          </span>
        </motion.div>
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900 drop-shadow-sm text-center">
          Welcome to Social Media App
        </h1>
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg mb-4 text-gray-600 text-center"
        >
          Connect, share, and discover with friends worldwide
        </motion.p>
        {/* Feature Highlights */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15, delayChildren: 0.6 },
            },
          }}
          className="flex gap-4 mb-6"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-col items-center"
          >
            <Users className="text-blue-500 mb-1" />
            <span className="text-xs text-gray-500">Communities</span>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-col items-center"
          >
            <MessageCircle className="text-purple-500 mb-1" />
            <span className="text-xs text-gray-500">Real-time Chat</span>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-col items-center"
          >
            <Star className="text-yellow-500 mb-1" />
            <span className="text-xs text-gray-500">Trending Posts</span>
          </motion.div>
        </motion.div>

        {/* Enhanced Get Started Button */}
        <motion.div
          whileHover={{
            scale: 1.06,
          }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex justify-center"
        >
          <Link
            href="/sign-in"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-500 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 animate-pulse-slow"
          >
            Get Started{" "}
            <ArrowRight className="ml-1 w-5 h-5 animate-move-right" />
          </Link>
        </motion.div>
        <Link
          href="/sign-up"
          className="mt-4 text-blue-600 hover:underline text-sm transition-colors"
        >
          New here? Create an account
        </Link>
      </motion.div>
      {/* Footer */}
      <footer className="mt-10 text-xs text-gray-500 flex flex-col items-center gap-1">
        <span>
          © {new Date().getFullYear()} SocialFlow. All rights reserved.
        </span>
      </footer>
    </main>
  );
}
