"use client";

import { Player } from "@lottiefiles/react-lottie-player";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#030507]/90 backdrop-blur-sm flex flex-col items-center justify-center z-999">
      <Player
        autoplay
        loop={false}
        src="/loading blue.json"
        style={{ width: 300, height: 200 }}
      />

      <p className="text-content-muted text-xs mt-4 tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
}