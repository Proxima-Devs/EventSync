"use client";

import { useState } from "react";

export default function HomePage() {
    return (
        <main className="flex-1 flex flex-col">
            <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#00E5FF08] blur-[120px]" />
                </div>

                <div className="mb-6 inline-flex items-center gap-2 border border-[#00E5FF33] bg-[#00E5FF0a] text-[#00E5FF] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
                    <span>✦</span> MadaTechEvent
                </div>
                <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
                    Synchronize Your
                    <br />
                    <span className="text-[#00E5FF]">Event Experience</span>
                </h1>
            </section>
        </main>
    );
}