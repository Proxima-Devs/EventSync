"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { SpeakerCard } from "@/components/SpeakerCard";
import { apiFetch } from "@/lib/api";
import { Search, Mic } from "lucide-react";
import type { SpeakerLinks } from "@/types";

type Speaker = {
  id: string;
  slug: string;
  fullName: string;
  photo?: string | null;
  bio?: string | null;
  links?: SpeakerLinks | null;
  _count: { sessions: number };
};

function SpeakerCardSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-[#1e2530] bg-surface-secondary p-6">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-surface-skeleton shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-2/3 bg-surface-skeleton rounded-lg" />
                    <div className="h-3 w-1/3 bg-surface-skeleton rounded-lg" />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-3 w-full bg-surface-skeleton rounded-lg" />
                <div className="h-3 w-4/5 bg-surface-skeleton rounded-lg" />
            </div>
        </div>
    );
}

export default function SpeakersPage() {
    const t = useTranslations("SpeakersPage");
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        apiFetch<Speaker[]>("/api/speakers")
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
            <div className="flex items-center gap-2 text-sm text-content-secondary mb-8">
                <Link href="/" className="hover:text-[#00E5FF] transition-colors">
                    {t("breadcrumbHome")}
                </Link>
                <span>/</span>
                <span className="text-content-default">{t("pageTitle")}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-content-default">
                        {t("pageTitle")}
                    </h1>
                    <p className="text-sm text-content-secondary mt-1">
                        {t("description")}
                    </p>
                </div>

                {!loading && !error && speakers.length > 0 && (
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder={t("searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-56 pl-9 pr-4 py-2.5 rounded-xl bg-surface-secondary border border-[#1e2530] text-sm text-content-default placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
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
                <div className="rounded-2xl border border-[#1e2530] bg-surface-secondary py-20 text-center">
                    <Mic size={28} className="mx-auto text-content-muted mb-3" />
                    <p className="text-content-muted italic text-sm">
                        {t("noSpeakers")}
                    </p>
                </div>
            )}

            {!loading && !error && speakers.length > 0 && filtered.length === 0 && (
                <div className="rounded-2xl border border-[#1e2530] bg-surface-secondary py-16 text-center">
                    <p className="text-content-muted italic text-sm">
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