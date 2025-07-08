"use client";
import { SignUp } from "@clerk/nextjs";
import { useState } from "react";

export default function Page() {
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md">
        <SignUp
          afterSignUpUrl="/feed"
          afterSignInUrl="/feed"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm normal-case",
              card: "bg-white/80 backdrop-blur-sm border-slate-200/50",
            },
          }}
          signInUrl="/sign-in"
          redirectUrl="/feed"
          routing="hash"
        />
        {error && (
          <div className="text-red-600 text-sm mt-4 text-center">{error}</div>
        )}
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-600 hover:underline">
            Please log in
          </a>
        </div>
      </div>
    </div>
  );
}
