"use client";

import { useState } from "react";
import EventCard from "../../components/EventCard";

export default function HomePage() {
    const [search, setSearch] = useState("");
    const [submitted, setSubmitted] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const FILTERS = ["All", "Upcoming", "Past"];


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
                    <span
                        className="inline-block"
                        style={{ animation: "slideInLeft 0.6s ease forwards", opacity: 0 }}
                    >
                        Synchronize
                    </span>{" "}
                    <span
                        className="inline-block"
                        style={{ animation: "slideInLeft 0.6s ease 0.2s forwards", opacity: 0 }}
                    >
                        Your
                    </span>
                    <br />
                    <span
                        className="text-[#00E5FF] inline-block"
                        style={{ animation: "blurIn 0.8s ease 0.4s forwards", opacity: 0 }}
                    >
                        Event
                    </span>{" "}
                    <span
                        className="text-[#00E5FF] inline-block"
                        style={{ animation: "blurIn 0.8s ease 0.6s forwards", opacity: 0 }}
                    >
                        Experience
                    </span>
                </h1>
                <p className="text-[#4a5568] max-w-xl mx-auto text-base mb-10 leading-relaxed">
                    Discover the most exciting tech conferences, workshops, and meetups
                    in Madagascar. Manage your schedule, connect with speakers, and never
                    miss a beat.
                </p>
                <div className="w-full max-w-xl flex rounded-full overflow-hidden border border-[#1e2530] bg-[#0d1117] shadow-xl shadow-[#00E5FF08]">
                    <span className="flex items-center pl-5 text-[#555]">
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Search events by title or keywords..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && setSubmitted(search)}
                        className="flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder-[#444] focus:outline-none"
                    />
                    <button
                        onClick={() => setSubmitted(search)}
                        className="px-6 py-4 bg-[#00E5FF] text-black font-bold text-sm hover:bg-[#00ffff] transition-colors"
                    >
                        Search
                    </button>
                </div>
            </section>
            <section className="px-8 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black">Featured Events</h2>
                        <div className="h-[3px] w-10 bg-[#00E5FF] rounded-full" />
                    </div>
                    <div className="flex gap-2 mb-6">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${activeFilter === filter
                                    ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-lg shadow-[#00E5FF33]"
                                    : "bg-transparent border-[#1e2530] text-[#4a5568] hover:text-white hover:border-[#00E5FF44]"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* TODO: remplacer par appel API */}
                    <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-20 col-span-full text-center text-[#3a4550] italic text-sm">
                        No events found.
                    </div>
                </div>
            </section>
        </main>
    );
}