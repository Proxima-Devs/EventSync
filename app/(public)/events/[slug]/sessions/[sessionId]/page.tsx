"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";

type Speaker = {
    id: string;
    fullName: string;
    photo?: string | null;
    bio?: string | null;
};
type SessionDetail = {
    id: string;
    title: string;
    description?: string | null;
    startTime: string;
    endTime: string;
    capacity?: number | null;
    isLive: boolean;
    room?: { id: string; name: string } | null;
    speakers: Speaker[];
};

export default function SessionDetailPage() {
    const { slug, sessionId } = useParams<{ slug: string; sessionId: string }>();
    const [session, setSession] = useState<SessionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { toggle, isFavorite } = useFavorites();

    useEffect(() => {
        // On récupère l'event par slug, puis on trouve la session dans ses sessions
        apiFetch<{ sessions: SessionDetail[] }>(`/api/events/slug/${slug}`)
            .then((data) => {
                const found = data.sessions.find((s) => s.id === sessionId);
                if (!found) setError("Session introuvable");
                else setSession(found);
            })
            .catch(() => setError("Erreur de chargement"))
            .finally(() => setLoading(false));
    }, [slug, sessionId]);

    if (loading) return <div className="p-8 text-[#4a5568]">Chargement...</div>;
    if (error || !session)
        return <div className="p-8 text-red-400">{error}</div>;

    return (
        <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
            <Link
                href={`/events/${slug}/sessions`}
                className="text-[#00E5FF] text-sm hover:underline"
            >
                ← Toutes les sessions
            </Link>

            <div className="mt-6 rounded-2xl border border-[#1e2530] bg-[#0d1117] p-8">
                {/* Live badge */}
                <div className="flex items-center gap-3 mb-4">
                    {session.isLive && (
                        <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                            🔴 LIVE
                        </span>
                    )}
                    {session.room && (
                        <span className="text-xs text-[#00E5FF] border border-[#00E5FF33] px-3 py-1 rounded-full">
                            📍 {session.room.name}
                        </span>
                    )}
                    <button
                        onClick={() => toggle(session.id)}
                        className="ml-auto text-2xl"
                        title={isFavorite(session.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        {isFavorite(session.id) ? "⭐" : "☆"}
                    </button>
                </div>

                <h1 className="text-3xl font-black mb-3">{session.title}</h1>

                <div className="text-sm text-[#4a5568] mb-6">
                    🕐{" "}
                    {new Date(session.startTime).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}{" "}
                    →{" "}
                    {new Date(session.endTime).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                    {session.capacity && <span className="ml-4">👥 {session.capacity} places</span>}
                </div>

                {session.description && (
                    <p className="text-[#4a5568] leading-relaxed mb-8">{session.description}</p>
                )}

                {/* Speakers */}
                {session.speakers.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold mb-4">Intervenants</h2>
                        <div className="flex flex-col gap-4">
                            {session.speakers.map((speaker) => (
                                <div key={speaker.id} className="flex items-center gap-4">
                                    {speaker.photo ? (
                                        <img
                                            src={speaker.photo}
                                            alt={speaker.fullName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#1e2530] flex items-center justify-center text-[#00E5FF] font-bold text-lg">
                                            {speaker.fullName[0]}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold">{speaker.fullName}</p>
                                        {speaker.bio && (
                                            <p className="text-xs text-[#4a5568] line-clamp-2">{speaker.bio}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}