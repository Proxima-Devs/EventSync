"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

type Session = {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    isLive: boolean;
    room?: { id: string; name: string } | null;
    event: { id: string; title: string; slug: string };
};

type SpeakerLinks = {
    twitter?: string;
    linkedin?: string;
    website?: string;
    github?: string;
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

const SOCIAL_ICONS: Record<string, { icon: string; label: string }> = {
    twitter: { icon: "𝕏", label: "Twitter / X" },
    linkedin: { icon: "in", label: "LinkedIn" },
    github: { icon: "⌥", label: "GitHub" },
    website: { icon: "🌐", label: "Site web" },
};

export default function SpeakerPage() {
    const { speakerId } = useParams<{ speakerId: string }>();
    const [speaker, setSpeaker] = useState<Speaker | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiFetch<Speaker>(`/api/speakers/${speakerId}`)
            .then(setSpeaker)
            .catch(() => setError("Intervenant introuvable"))
            .finally(() => setLoading(false));
    }, [speakerId]);

    if (loading)
        return (
            <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 w-32 bg-[#1e2530] rounded-full" />
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-[#1e2530]" />
                        <div className="space-y-2 flex-1">
                            <div className="h-6 w-1/2 bg-[#1e2530] rounded-xl" />
                            <div className="h-4 w-1/3 bg-[#1e2530] rounded-xl" />
                        </div>
                    </div>
                    <div className="h-32 bg-[#1e2530] rounded-2xl" />
                </div>
            </main>
        );

    if (error || !speaker)
        return (
            <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
                <div className="rounded-2xl border border-red-900 bg-red-500/10 py-12 text-center text-red-400 text-sm">
                    {error || "Intervenant introuvable"}
                </div>
            </main>
        );

    const links = speaker.links ?? {};
    const sessions = speaker.sessions ?? [];

    return (
        <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8">
                <Link href="/" className="hover:text-[#00E5FF] transition-colors">
                    Accueil
                </Link>
                <span>/</span>
                <span className="text-white">{speaker.fullName}</span>
            </div>

            <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-8 mb-6">
                <div className="flex items-start gap-6">
                    {speaker.photo ? (
                        <Image
                            src={speaker.photo}
                            alt={speaker.fullName}
                            width={96}
                            height={96}
                            unoptimized
                            className="w-24 h-24 rounded-full object-cover shrink-0 ring-2 ring-[#00E5FF33]"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-[#1e2530] flex items-center justify-center text-[#00E5FF] font-black text-4xl shrink-0">
                            {speaker.fullName[0]}
                        </div>
                    )}

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
                                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[#1e2530] text-[#4a5568] hover:text-[#00E5FF] hover:border-[#00E5FF44] transition-all"
                                        >
                                            <span className="font-bold">{meta?.icon ?? "🔗"}</span>
                                            {meta?.label ?? key}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {speaker.bio && (
                    <p className="text-[#6b7280] leading-relaxed mt-6 border-t border-[#1e2530] pt-6">
                        {speaker.bio}
                    </p>
                )}
            </div>

            <h2 className="text-xl font-black mb-4">
                Sessions{" "}
                <span className="text-[#4a5568] font-normal text-base">
                    ({sessions.length})
                </span>
            </h2>

            {sessions.length === 0 ? (
                <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-16 text-center text-[#3a4550] italic text-sm">
                    Aucune session assignée.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {sessions.map((session) => (
                        <Link
                            key={session.id}
                            href={`/events/${session.event.slug}/sessions/${session.id}`}
                            className="block rounded-2xl border border-[#1e2530] bg-[#0d1117] p-5 hover:border-[#00E5FF44] transition-all duration-200"
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
                                <span className="text-xs text-[#4a5568]">
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