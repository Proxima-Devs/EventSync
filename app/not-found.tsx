"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#030507] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-[#00E5FF05] blur-[120px] pointer-events-none" />

      <div style={{ width: 320, height: 320 }}>
        <Player
          autoplay
          loop
          src="/Error 404.json"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <h1 className="text-2xl font-black text-white mb-2">
        Page not found
      </h1>
      <p className="text-[#4a5568] text-sm mb-8 text-center max-w-xs">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>

      <Link
        href="/"
        className="px-6 py-3 rounded-2xl bg-[#00E5FF] text-black font-bold text-sm hover:bg-[#00ffff] transition-all shadow-lg shadow-[#00E5FF33] hover:scale-105"
      >
        Back to Home →
      </Link>
    </main>
  );
}