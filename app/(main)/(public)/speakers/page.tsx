"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { Search, Mic } from "lucide-react";
import { SpeakerLinks } from "@/types";

type Speaker = {
    id: string;
    slug: string;
    fullName: string;
    photo?: string | null;
    bio?: string | null;
    links?: SpeakerLinks | null;
    _count: { sessions: number };
};

const SOCIAL_ICONS: Record<string, { icon: string; label: string }> = {
    twitter: { icon: "𝕏", label: "Twitter" },
    linkedin: { icon: "in", label: "LinkedIn" },
    github: { icon: "⌥", label: "GitHub" },
    website: { icon: "🌐", label: "Site" },
};

function SpeakerCardSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1e2530] shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-2/3 bg-[#1e2530] rounded-lg" />
                    <div className="h-3 w-1/3 bg-[#1e2530] rounded-lg" />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-3 w-full bg-[#1e2530] rounded-lg" />
                <div className="h-3 w-4/5 bg-[#1e2530] rounded-lg" />
            </div>
        </div>
    );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
    const initials = speaker.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const links = speaker.links ?? {};
    const activeSocials = Object.entries(links).filter(([, url]) => !!url);

    return (
        <Link
            href={`/speakers/${speaker.slug}`}
            className="group relative flex flex-col rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6 hover:border-[#00E5FF33] hover:bg-[#0d1117] transition-all duration-300"
        >
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_top_left,#00E5FF08_0%,transparent_60%)]" />

            <div className="flex items-start gap-4">
                {speaker.photo ? (
                    <Image
                        src={speaker.photo}
                        alt={speaker.fullName}
                        width={56}
                        height={56}
                        unoptimized
                        className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-[#1e2530] group-hover:ring-[#00E5FF33] transition-all duration-300"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#00E5FF22] to-[#0066ff22] border border-[#00E5FF22] flex items-center justify-center text-[#00E5FF] font-black text-lg shrink-0 group-hover:from-[#00E5FF33] group-hover:to-[#0066ff33] transition-all duration-300">
                        {initials}
                    </div>
                )}

                <div className="flex-1 min-w-0 pt-0.5">
                    <h2 className="font-bold text-[#eee] truncate group-hover:text-white transition-colors leading-tight">
                        {speaker.fullName}
                    </h2>
                    <p className="text-xs text-[#3a4a5a] mt-1 flex items-center gap-1.5">
                        <Mic size={11} className="shrink-0" />
                        {speaker._count.sessions === 0
                            ? "Aucune session"
                            : speaker._count.sessions === 1
                            ? "1 session"
                            : `${speaker._count.sessions} sessions`}
                    </p>
                </div>
            </div>

            {speaker.bio && (
                <p className="text-sm text-[#4a5568] leading-relaxed mt-4 line-clamp-2">
                    {speaker.bio}
                </p>
            )}

            {activeSocials.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-4 pt-4 border-t border-[#1e2530]">
                    {activeSocials.map(([key]) => {
                        const meta = SOCIAL_ICONS[key];
                        return (
                            <span
                                key={key}
                                className="inline-flex items-center text-[10px] px-2 py-1 rounded-full border border-[#1e2530] text-[#3a4a5a] font-semibold"
                            >
                                {meta?.icon ?? "🔗"} {meta?.label ?? key}
                            </span>
                        );
                    })}
                </div>
            )}
        </Link>
    );
}

export default function SpeakersPage() {
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        apiFetch<Speaker[]>("/api/speakers")
            .then(setSpeakers)
            .catch(() => setError("Impossible de charger les intervenants"))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return speakers;
        return speakers.filter(
            (s) =>
                s.fullName.toLowerCase().includes(q) ||
                s.bio?.toLowerCase().includes(q)
        );
    }, [speakers, search]);

    return (
        <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8">
                <Link href="/" className="hover:text-[#00E5FF] transition-colors">
                    Accueil
                </Link>
                <span>/</span>
                <span className="text-white">Intervenants</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-white">
                        Intervenants
                        {!loading && speakers.length > 0 && (
                            <span className="ml-3 text-base font-normal text-[#3a4a5a]">
                                {speakers.length}
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-[#4a5568] mt-1">
                        Découvrez les experts qui interviennent lors de nos événements.
                    </p>
                </div>

                {!loading && !error && speakers.length > 0 && (
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a4a5a] pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Rechercher…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-56 pl-9 pr-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
                        />
                    </div>
                )}
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SpeakerCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-900 bg-red-500/10 py-12 text-center text-red-400 text-sm">
                    {error}
                </div>
            )}

            {!loading && !error && speakers.length === 0 && (
                <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-20 text-center">
                    <Mic size={28} className="mx-auto text-[#1e2530] mb-3" />
                    <p className="text-[#3a4a5a] italic text-sm">
                        Aucun intervenant pour le moment.
                    </p>
                </div>
            )}

            {!loading && !error && speakers.length > 0 && filtered.length === 0 && (
                <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-16 text-center">
                    <p className="text-[#3a4a5a] italic text-sm">
                        Aucun intervenant ne correspond à «&nbsp;{search}&nbsp;».
                    </p>
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((speaker) => (
                        <SpeakerCard key={speaker.id} speaker={speaker} />
                    ))}
                </div>
            )}
        </main>
    );
}