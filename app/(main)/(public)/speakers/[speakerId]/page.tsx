"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

import { SpeakerLinks } from "@/types";

type Session = {
    id: string;
    slug: string;
    title: string;
    startTime: string;
    endTime: string;
    isLive: boolean;
    room?: { id: string; name: string } | null;
    event: { id: string; title: string; slug: string };
};

type Speaker = {
    id: string;
    fullName: string;
    photo?: string | null;
    bio?: string | null;
    links?: SpeakerLinks | null;
    sessions: Session[];
};

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

const SOCIAL_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
    twitter: {
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        label: "Twitter / X",
    },
    linkedin: {
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
        label: "LinkedIn",
    },
    github: {
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
        ),
        label: "GitHub",
    },
    website: {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        ),
        label: "Site web",
    },
};

export default function SpeakerPage() {
    const t = useTranslations("SpeakerPage");
    const { speakerId } = useParams<{ speakerId: string }>();
    const [speaker, setSpeaker] = useState<Speaker | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiFetch<Speaker>(`/api/speakers/${speakerId}`)
            .then(setSpeaker)
            .catch(() => setError(t("notFound")))
            .finally(() => setLoading(false));
    }, [speakerId]);

    useEffect(() => {
        if (speaker?.fullName) {
            document.title = speaker?.fullName;
        }
    }, [speaker]);

    if (loading)
        return (
            <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 w-32 bg-surface-skeleton rounded-full" />
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-surface-skeleton" />
                        <div className="space-y-2 flex-1">
                            <div className="h-6 w-1/2 bg-surface-skeleton rounded-xl" />
                            <div className="h-4 w-1/3 bg-surface-skeleton rounded-xl" />
                        </div>
                    </div>
                    <div className="h-32 bg-surface-skeleton rounded-2xl" />
                </div>
            </main>
        );

    if (error || !speaker)
        return (
            <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
                <div className="rounded-2xl border border-red-900 bg-red-500/10 py-12 text-center text-red-400 text-sm">
                    {error || t("notFound")}
                </div>
            </main>
        );

    const links = speaker.links ?? {};
    const sessions = speaker.sessions ?? [];

    return (
        <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-2 text-sm text-content-secondary mb-8">
                <Link href="/" className="hover:text-[#00E5FF] transition-colors">
                    {t("breadcrumbHome")}
                </Link>
                <span>/</span>
                <Link href="/speakers" className="hover:text-[#00E5FF] transition-colors">
                    {t("breadcrumbSpeakers")}
                </Link>
                <span>/</span>
                <span className="text-content-default">{speaker.fullName}</span>
            </div>

            <div className="rounded-2xl border border-[#1e2530] bg-surface-secondary p-8 mb-6">
                <div className="flex items-start gap-6">
                    <img
                        src={speaker.photo ?? `https://api.dicebear.com/7.x/adventurer/svg?seed=${speaker.fullName}&flip=true&radius=50`}
                        alt={speaker.fullName}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover shrink-0 ring-2 ring-[#00E5FF33]"
                    />
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-black mb-1">{speaker.fullName}</h1>

                        {Object.keys(links).length > 0 && (
                            <div className="flex gap-2 flex-wrap mt-3">
                                {Object.entries(links).map(([key, url]) => {
                                    if (!url) return null;
                                    const meta = SOCIAL_ICONS[key];
                                    return (
                                        <a
                                            key={key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[#1e2530] text-content-secondary hover:text-[#00E5FF] hover:border-[#00E5FF44] transition-all"
                                        >
                                            {meta?.icon ?? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                </svg>
                                            )}
                                            {t(`social.${key}` as any) || key}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {speaker.bio && (
                    <p className="text-content-muted leading-relaxed mt-6 border-t border-[#1e2530] pt-6">
                        {speaker.bio}
                    </p>
                )}
            </div>

            <h2 className="text-xl font-black mb-4">
                {t("sessionsTitle")} {" "}
                <span className="text-content-secondary font-normal text-base">
                    ({sessions.length})
                </span>
            </h2>

            {sessions.length === 0 ? (
                <div className="rounded-2xl border border-[#1e2530] bg-surface-secondary py-16 text-center text-content-muted italic text-sm">
                    {t("noSessions")}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {sessions.map((session) => (
                        <Link
                            key={session.id}
                            href={`/events/${session.event.slug}/sessions/${session.slug}`}
                            className="block rounded-2xl border border-[#1e2530] bg-surface-secondary p-5 hover:border-[#00E5FF44] transition-all duration-200"
                        >
                            <p className="text-xs text-[#00E5FF] mb-2 font-semibold">
                                {session.event.title}
                            </p>

                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {session.isLive && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                                        LIVE
                                    </span>
                                )}
                                <span className="text-xs text-content-secondary">
                                    {formatTime(session.startTime)} → {formatTime(session.endTime)}
                                </span>
                                {session.room && (
                                    <span className="text-xs text-[#00E5FF] border border-[#00E5FF33] px-2 py-0.5 rounded-full">
                                        {session.room.name}
                                    </span>
                                )}
                            </div>

                            <p className="font-bold">{session.title}</p>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}