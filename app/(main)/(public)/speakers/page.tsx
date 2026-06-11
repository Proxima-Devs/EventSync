"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
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

const SOCIAL_ICONS: Record<string, { icon: React.ReactNode }> = {
    twitter: {
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    linkedin: {
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    github: {
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
        ),
    },
    website: {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        ),
    },
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
    const t = useTranslations("SpeakersPage");
    const links = speaker.links ?? {};
    const activeSocials = Object.entries(links).filter(([, url]) => !!url);

    return (
        <Link
            href={`/speakers/${speaker.slug}`}
            className="group relative flex flex-col rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6 hover:border-[#00E5FF33] hover:bg-[#0d1117] transition-all duration-300"
        >
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_top_left,#00E5FF08_0%,transparent_60%)]" />

            <div className="flex items-start gap-4">
                <Image
                    src={speaker.photo ?? `https://api.dicebear.com/7.x/adventurer/svg?seed=${speaker.fullName}&flip=true&radius=50`}
                    alt={speaker.fullName}
                    width={56}
                    height={56}
                    unoptimized
                    className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-[#1e2530] group-hover:ring-[#00E5FF33] transition-all duration-300"
                />

                <div className="flex-1 min-w-0 pt-0.5">
                    <h2 className="font-bold text-[#eee] truncate group-hover:text-white transition-colors leading-tight">
                        {speaker.fullName}
                    </h2>
                    <p className="text-xs text-[#3a4a5a] mt-1 flex items-center gap-1.5">
                        <Mic size={11} className="shrink-0" />
                        {speaker._count.sessions === 0
                            ? t("sessionsZero")
                            : speaker._count.sessions === 1
                                ? t("sessionsOne")
                                : t("sessionsMany", { count: speaker._count.sessions })}
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
                        const label = t(`social.${key}` as any);
                        return (
                            <span
                                key={key}
                                className="inline-flex items-center text-[10px] px-2 py-1 rounded-full border border-[#1e2530] text-[#3a4a5a] font-semibold"
                            >
                                {meta?.icon ?? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                )}
                                {label || key}
                            </span>
                        );
                    })}
                </div>
            )}
        </Link>
    );
}

export default function SpeakersPage() {
    const t = useTranslations("SpeakersPage");
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        apiFetch<Speaker[]>"/api/speakers")
            .then(setSpeakers)
            .catch(() => setError(t("errorLoad")))
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
                    {t("breadcrumbHome")}
                </Link>
                <span>/</span>
                <span className="text-white">{t("pageTitle")}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-white">
                        {t("pageTitle")}
                        {!loading && speakers.length > 0 && (
                            <span className="ml-3 text-base font-normal text-[#3a4a5a]">
                                {speakers.length}
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-[#4a5568] mt-1">
                        {t("description")}
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
                            placeholder={t("searchPlaceholder")}
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
                        {t("noSpeakers")}
                    </p>
                </div>
            )}

            {!loading && !error && speakers.length > 0 && filtered.length === 0 && (
                <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-16 text-center">
                    <p className="text-[#3a4a5a] italic text-sm">
                        {t("noResults", { query: search })}
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