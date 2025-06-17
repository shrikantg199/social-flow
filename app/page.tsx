import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) {
    redirect("/feed");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Social Media App</h1>
        <p className="text-xl mb-8">
          Connect with friends and share your moments
        </p>
        <a
          href="/sign-in"
          className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
        >
          Get Started
        </a>
      </div>
    </main>
  );
}
