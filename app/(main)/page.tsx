"use client";

import { useState } from "react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#00E5FF08] blur-[120px]" />
        </div>
      </section>
    </main>
  );
}