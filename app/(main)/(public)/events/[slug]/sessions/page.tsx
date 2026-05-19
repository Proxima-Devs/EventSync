"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";
import { Session, EventMeta } from "@/types";

const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes titleColorCycle {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes barColorCycle {
    0%   { background: linear-gradient(90deg, transparent, #00E5FF, transparent); }
    33%  { background: linear-gradient(90deg, transparent, #7b61ff, transparent); }
    66%  { background: linear-gradient(90deg, transparent, #00ffc8, transparent); }
    100% { background: linear-gradient(90deg, transparent, #00E5FF, transparent); }
  }
  @keyframes badgeShimmer {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  @keyframes glowCycle {
    0%,100% { box-shadow: 0 0 0 0 transparent; }
    25%      { box-shadow: 0 0 18px 2px rgba(0,229,255,0.18); }
    50%      { box-shadow: 0 0 18px 2px rgba(123,97,255,0.18); }
    75%      { box-shadow: 0 0 18px 2px rgba(0,255,200,0.15); }
  }
  @keyframes livePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
    50%      { box-shadow: 0 0 0 7px rgba(239,68,68,0); }
  }
  @keyframes scanline {
    from { transform: translateX(-100%); }
    to   { transform: translateX(400%); }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0); opacity: 0.07; }
    50%      { transform: translate(25px,-18px); opacity: 0.12; }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0); opacity: 0.05; }
    50%      { transform: translate(-18px,22px); opacity: 0.09; }
  }
  @keyframes filterPop {
    from { transform: scale(0.94); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  @keyframes starPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.4) rotate(-10deg); }
    70%  { transform: scale(0.9) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }

  .page-enter { animation: fadeSlideUp 0.5s ease both; }
  .top-bar    { animation: barColorCycle 6s ease-in-out infinite; height: 1px; width: 100%; }

  .orb1 { animation: orb1  9s ease-in-out infinite; }
  .orb2 { animation: orb2 12s ease-in-out infinite; }

  .accent-bar {
    width: 36px; height: 3px; border-radius: 99px;
    background: linear-gradient(90deg, #00E5FF, #7b61ff, #00ffc8, #00E5FF);
    background-size: 300% 100%;
    animation: titleColorCycle 4s ease-in-out infinite;
    box-shadow: 0 0 12px rgba(0,229,255,0.7);
    margin-bottom: 20px;
  }

  .title-animated {
    background: linear-gradient(135deg, #ffffff 0%, #00E5FF 30%, #7b61ff 60%, #ffffff 100%);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: titleColorCycle 7s ease-in-out infinite;
  }

  /* ── Filter pills ── */
  .filter-pill {
    cursor: pointer;
    padding: 6px 16px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid #1e2530;
    color: #4a5568;
    background: #0d1117;
    transition: border-color 0.2s, color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s;
    animation: filterPop 0.3s ease both;
  }
  .filter-pill:hover {
    border-color: #00E5FF44;
    color: #cce8f0;
    background: rgba(0,229,255,0.05);
  }
  .filter-pill:active { transform: scale(0.96); }
  .filter-pill.active {
    background: #00E5FF;
    border-color: #00E5FF;
    color: #000;
    box-shadow: 0 0 16px rgba(0,229,255,0.4);
    animation: titleColorCycle 3s ease-in-out infinite;
  }

  /* ── Session cards ── */
  .session-card {
    animation: fadeSlideUp 0.4s ease both;
    position: relative;
    overflow: hidden;
    border-radius: 18px;
    border: 1px solid #1e2530;
    background: #0d1117;
    transition: transform 0.25s, background 0.2s;
    text-decoration: none;
    display: block;
  }
  .session-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 38%, rgba(0,229,255,0.05) 50%, transparent 62%);
    background-size: 200% 100%;
    opacity: 0;
    pointer-events: none;
    border-radius: inherit;
    transition: opacity 0.2s;
  }
  .session-card:hover::before {
    opacity: 1;
    animation: badgeShimmer 1.3s linear infinite;
  }
  .session-card:hover {
    transform: translateY(-2px);
    background: #0f1622 !important;
    animation: glowCycle 3s ease-in-out infinite;
  }

  /* ── Room badge shimmer ── */
  .room-badge {
    background: linear-gradient(90deg, rgba(0,229,255,0.08), rgba(123,97,255,0.12), rgba(0,255,200,0.08));
    background-size: 200% 100%;
    animation: badgeShimmer 3s linear infinite;
    border: 1px solid #00E5FF33;
    color: #00E5FF;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 999px;
  }

  /* ── LIVE ── */
  .badge-live { animation: livePulse 1.5s ease-in-out infinite; }

  /* ── Star button ── */
  .star-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 6px;
    border-radius: 8px;
    transition: background 0.2s, transform 0.15s;
    position: absolute;
    top: 14px; right: 14px;
    color: #4a5568;
    display: flex; align-items: center; justify-content: center;
  }
  .star-btn:hover { background: rgba(0,229,255,0.08); transform: scale(1.1); }
  .star-btn.active { color: #fbbf24; }
  .star-btn.pop { animation: starPop 0.35s ease; }

  .back-link { transition: color 0.2s; }
  .back-link:hover { color: #00E5FF; }
  .back-link .arrow-icon { transition: transform 0.2s; }
  .back-link:hover .arrow-icon { transform: translateX(-3px); }

  .count-badge {
    font-size: 11px; font-weight: 700;
    background: rgba(0,229,255,0.08);
    border: 1px solid #00E5FF22;
    color: #00E5FF;
    border-radius: 6px;
    padding: 1px 7px;
  }
  .divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, #1e2530, transparent); }
`;

function useInjectStyles(css: string) {
    useEffect(() => {
        const id = "sessions-page-v1";
        if (!document.getElementById(id)) {
            const el = document.createElement("style");
            el.id = id;
            el.textContent = css;
            document.head.appendChild(el);
        }
        return () => { document.getElementById(id)?.remove(); };
    }, []);
}

export default function SessionsPage() {
    const { slug } = useParams<{ slug: string }>();
    const [event, setEvent] = useState<EventMeta | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
    const [activeRoom, setActiveRoom] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [starPop, setStarPop] = useState<string | null>(null);
    const { toggle, isFavorite } = useFavorites();

    useInjectStyles(STYLES);

    useEffect(() => {
        apiFetch<EventMeta & { sessions: Session[] }>(`/api/events/slug/${slug}`)
            .then((data) => {
                setEvent({ id: data.id, title: data.title, slug: data.slug });
                setSessions(data.sessions);
                return apiFetch<{ id: string; name: string }[]>(`/api/events/${data.id}/rooms`);
            })
            .then(setRooms)
            .finally(() => setLoading(false));
    }, [slug]);

    const filtered =
        activeRoom === "all"
            ? sessions
            : sessions.filter((s) => s.room?.id === activeRoom);

    const handleToggleFav = (id: string) => {
        toggle(id);
        setStarPop(id);
        setTimeout(() => setStarPop(null), 400);
    };

    if (loading)
        return (
            <div style={{ minHeight: "100vh", background: "#0a0e17", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #00E5FF", borderTopColor: "transparent" }} className="animate-spin" />
                    <span style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>Chargement</span>
                </div>
            </div>
        );

    return (
        <main style={{ minHeight: "100vh", background: "#0a0e17", color: "#fff", position: "relative", overflow: "hidden" }}>

            {/* ── Orbs ── */}
            <div className="orb1" style={{
                position: "absolute", top: -160, left: -160, width: 520, height: 520,
                borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)",
            }} />
            <div className="orb2" style={{
                position: "absolute", top: "40%", right: -100, width: 380, height: 380,
                borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(circle, rgba(123,97,255,0.06) 0%, transparent 70%)",
            }} />

            {/* ── Top bar ── */}
            <div className="top-bar" style={{ position: "relative", zIndex: 1 }} />

            <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 24px", position: "relative", zIndex: 1 }}
                 className="page-enter">

                {/* ── Back ── */}
                <Link href={`/events/${slug}`} className="back-link" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "#4a5568", textDecoration: "none", marginBottom: 48,
                }}>
                    <span className="arrow-icon" style={{ fontSize: 10 }}>←</span>
                    {event?.title ?? "Retour"}
                </Link>

                {/* ── Header ── */}
                <header style={{ marginBottom: 40 }}>
                    <div className="accent-bar" />
                    <h1 className="title-animated" style={{
                        fontSize: "2.4rem", fontWeight: 900, lineHeight: 1.08,
                        letterSpacing: "-0.02em", marginBottom: 0,
                    }}>
                        Sessions
                    </h1>
                </header>

                {/* ── Filter pills ── */}
                {rooms.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 40 }}>
                        <button
                            onClick={() => setActiveRoom("all")}
                            className={`filter-pill${activeRoom === "all" ? " active" : ""}`}
                        >
                            Toutes
                        </button>
                        {rooms.map((room, i) => (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoom(room.id)}
                                className={`filter-pill${activeRoom === room.id ? " active" : ""}`}
                                style={{ animationDelay: `${i * 40}ms` }}
                            >
                                {room.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Sessions heading ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4a5568", fontWeight: 600, whiteSpace: "nowrap" }}>
            Sessions
          </span>
                    <span className="count-badge">{filtered.length}</span>
                    <div className="divider-line" />
                </div>

                {/* ── Session list ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.map((session, i) => (
                        <div key={session.id} style={{ position: "relative" }}>
                            <Link
                                href={`/events/${slug}/sessions/${session.slug}`}
                                className="session-card"
                                style={{
                                    padding: "18px 56px 18px 20px",
                                    animationDelay: `${i * 45}ms`,
                                }}
                            >
                                {/* Top row */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                    {session.isLive && (
                                        <span className="badge-live" style={{
                                            display: "inline-flex", alignItems: "center", gap: 4,
                                            fontSize: 10, background: "#ef4444", color: "#fff",
                                            padding: "2px 8px", borderRadius: 999, fontWeight: 700,
                                        }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} className="animate-pulse" />
                      LIVE
                    </span>
                                    )}
                                    <span style={{ fontSize: 11, color: "#4a5568", fontVariantNumeric: "tabular-nums" }}>
                    {new Date(session.startTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                        {" → "}
                                        {new Date(session.endTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                                    {session.room && (
                                        <span className="room-badge">{session.room.name}</span>
                                    )}
                                </div>

                                <p style={{ fontWeight: 700, color: "#fff", fontSize: 15, lineHeight: 1.35, margin: 0 }}>
                                    {session.title}
                                </p>

                                {session.speakers.length > 0 && (
                                    <p style={{ fontSize: 11, color: "#3a4a5a", margin: "5px 0 0" }}>
                                        {session.speakers.map((s) => s.fullName).join(", ")}
                                    </p>
                                )}
                            </Link>

                            {/* ── Star button ── */}
                            <button
                                onClick={() => handleToggleFav(session.id)}
                                className={`star-btn${isFavorite(session.id) ? " active" : ""}${starPop === session.id ? " pop" : ""}`}
                                title={isFavorite(session.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                                {isFavorite(session.id) ? "⭐" : "☆"}
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}