"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faArrowLeft,
  faMapPin,
  faCalendar,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

type Speaker = { id: string; fullName: string; photo?: string | null };
type Session = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  isLive: boolean;
  room?: { id: string; name: string } | null;
  speakers: Speaker[];
};
type EventDetail = {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  startDate: string;
  endDate: string;
  location?: string | null;
  coverImage?: string | null;
  sessions: Session[];
};

const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Titre : gradient qui tourne en couleur ── */
  @keyframes titleColorCycle {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* ── Accent bar : cycle de couleur doux ── */
  @keyframes barColorCycle {
    0%   { background: linear-gradient(90deg, transparent, #00E5FF, transparent); }
    33%  { background: linear-gradient(90deg, transparent, #7b61ff, transparent); }
    66%  { background: linear-gradient(90deg, transparent, #00ffc8, transparent); }
    100% { background: linear-gradient(90deg, transparent, #00E5FF, transparent); }
  }

  /* ── Bordure des cards : hue rotate ── */
  @keyframes borderHue {
    0%   { border-color: #1e2530; }
    50%  { border-color: #00E5FF33; }
    100% { border-color: #1e2530; }
  }

  /* ── Glow pulsant cyan/violet ── */
  @keyframes glowCycle {
    0%,100% { box-shadow: 0 0 0 0 transparent; }
    25%      { box-shadow: 0 0 18px 2px rgba(0,229,255,0.18); }
    50%      { box-shadow: 0 0 18px 2px rgba(123,97,255,0.18); }
    75%      { box-shadow: 0 0 18px 2px rgba(0,255,200,0.15); }
  }

  /* ── Icône horloge : couleur qui tourne ── */
  @keyframes iconColorCycle {
    0%,100% { color: #2a3545; }
    33%      { color: #00E5FF55; }
    66%      { color: #7b61ff55; }
  }

  /* ── Badge salle : fond shimmer ── */
  @keyframes badgeShimmer {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  /* ── LIVE pulse rouge ── */
  @keyframes livePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
    50%      { box-shadow: 0 0 0 7px rgba(239,68,68,0); }
  }

  /* ── Orbs ── */
  @keyframes orb1 {
    0%,100% { transform: translate(0,0); opacity: 0.07; }
    50%      { transform: translate(25px,-18px); opacity: 0.12; }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0); opacity: 0.05; }
    50%      { transform: translate(-18px,22px); opacity: 0.09; }
  }

  /* ── Scanline CTA ── */
  @keyframes scanline {
    from { transform: translateX(-100%); }
    to   { transform: translateX(400%); }
  }

  /* ── Arrow hover ── */
  .session-arrow { transition: transform 0.22s, color 0.22s; color: #1e2530; }
  .session-card:hover .session-arrow {
    transform: translateX(4px);
    color: #00E5FF99;
  }

  /* ── Card ── */
  .session-card {
    animation: fadeSlideUp 0.4s ease both;
    position: relative;
    overflow: hidden;
    transition: transform 0.25s, background 0.2s;
  }
  .session-card:hover {
    transform: translateY(-2px);
    background: #0f1622 !important;
    animation: glowCycle 3s ease-in-out infinite;
  }

  /* shimmer overlay */
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

  .clock-icon { transition: color 0.3s; }
  .session-card:hover .clock-icon {
    animation: iconColorCycle 3s ease-in-out infinite;
  }

  .clock-wrap { transition: border-color 0.3s, background 0.3s; }
  .session-card:hover .clock-wrap {
    border-color: #00E5FF33;
    background: #060d18;
  }

  /* ── CTA primary ── */
  .cta-primary {
    position: relative; overflow: hidden;
    transition: box-shadow 0.2s, transform 0.1s, background 0.15s;
  }
  .cta-primary:hover {
    background: #00ffff;
    box-shadow: 0 0 28px rgba(0,229,255,0.45), 0 0 8px rgba(0,229,255,0.6);
  }
  .cta-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
    background-size: 200% 100%;
    opacity: 0;
  }
  .cta-primary:hover::after { opacity: 1; animation: scanline 0.55s linear; }
  .cta-primary:active { transform: scale(0.97); }

  .cta-secondary { transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.1s; }
  .cta-secondary:hover { border-color: #00E5FF44; color: #e0f8ff; background: rgba(0,229,255,0.06); }
  .cta-secondary:active { transform: scale(0.97); }

  .back-link { transition: color 0.2s; }
  .back-link:hover { color: #00E5FF; }
  .back-link .arrow-icon { transition: transform 0.2s; }
  .back-link:hover .arrow-icon { transform: translateX(-3px); }

  .meta-chip { transition: border-color 0.2s, color 0.2s; }
  .meta-chip:hover { border-color: #00E5FF33; color: #9ec8d5; }

  .page-enter { animation: fadeSlideUp 0.5s ease both; }

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

  /* ── Orbs ── */
  .orb1 { animation: orb1 9s ease-in-out infinite; }
  .orb2 { animation: orb2 12s ease-in-out infinite; }

  /* ── Top bar color cycle ── */
  .top-bar { animation: barColorCycle 6s ease-in-out infinite; height: 1px; width: 100%; }

  /* ── Accent dot glow ── */
  .accent-bar {
    width: 36px; height: 3px; border-radius: 99px;
    background: linear-gradient(90deg, #00E5FF, #7b61ff, #00ffc8, #00E5FF);
    background-size: 300% 100%;
    animation: titleColorCycle 4s ease-in-out infinite;
    box-shadow: 0 0 12px rgba(0,229,255,0.7);
  }

  /* ── Title gradient animation ── */
  .title-animated {
    background: linear-gradient(135deg, #ffffff 0%, #00E5FF 30%, #7b61ff 60%, #ffffff 100%);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: titleColorCycle 7s ease-in-out infinite;
  }

  /* ── Count badge ── */
  .count-badge {
    font-size: 11px; font-weight: 700;
    background: rgba(0,229,255,0.08);
    border: 1px solid #00E5FF22;
    color: #00E5FF;
    border-radius: 6px;
    padding: 1px 7px;
    animation: borderHue 4s ease-in-out infinite;
  }

  .divider-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, #1e2530, transparent);
  }
`;

function useInjectStyles(css: string) {
  useEffect(() => {
    const id = "event-detail-v4";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = css;
      document.head.appendChild(el);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);
}

function TimeProgress({ start, end }: { start: string; end: string }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      if (now < s) return setPct(0);
      if (now > e) return setPct(100);
      setPct(Math.round(((now - s) / (e - s)) * 100));
    };
    calc();
    const id = setInterval(calc, 30_000);
    return () => clearInterval(id);
  }, [start, end]);
  if (pct <= 0 || pct >= 100) return null;
  return (
      <div style={{ marginTop: 8, height: 2, width: "100%", borderRadius: 99, background: "#1e2530", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 99,
          background: "linear-gradient(90deg, #7b61ff, #00E5FF, #00ffc8)",
          backgroundSize: "200% 100%",
          boxShadow: "0 0 8px rgba(0,229,255,0.7)",
          animation: "badgeShimmer 2s linear infinite, titleColorCycle 4s ease-in-out infinite",
          transition: "width 30s linear",
        }} />
      </div>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useInjectStyles(STYLES);

  useEffect(() => {
    apiFetch<EventDetail>(`/api/events/slug/${slug}`)
        .then(setEvent)
        .catch(() => setError("Événement introuvable"))
        .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
        <div style={{ minHeight: "100vh", background: "#0a0e17", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #00E5FF", borderTopColor: "transparent" }} className="animate-spin" />
            <span style={{ color: "#4a5568", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>Chargement</span>
          </div>
        </div>
    );

  if (error || !event)
    return (
        <div style={{ minHeight: "100vh", background: "#0a0e17", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#f87171" }}>{error || "Événement introuvable"}</p>
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
          position: "absolute", top: "45%", right: -100, width: 380, height: 380,
          borderRadius: "50%", pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(circle, rgba(123,97,255,0.06) 0%, transparent 70%)",
        }} />

        {/* ── Top bar ── */}
        <div className="top-bar" style={{ position: "relative", zIndex: 1 }} />

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 24px", position: "relative", zIndex: 1 }}
             className="page-enter">

          {/* ── Back ── */}
          <Link href="/" className="back-link" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#4a5568", textDecoration: "none", marginBottom: 48,
          }}>
            <FontAwesomeIcon icon={faArrowLeft} className="arrow-icon" style={{ fontSize: 10 }} />
            Retour aux événements
          </Link>

          {/* ── Header ── */}
          <header style={{ marginBottom: 48 }}>
            <div className="accent-bar" style={{ marginBottom: 20 }} />

            <h1 className="title-animated" style={{
              fontSize: "2.6rem", fontWeight: 900, lineHeight: 1.08,
              letterSpacing: "-0.02em", marginBottom: 16,
            }}>
              {event.title}
            </h1>

            {event.description && (
                <p style={{ color: "#4a5568", fontSize: 15, lineHeight: 1.7, maxWidth: 540, marginBottom: 24 }}>
                  {event.description}
                </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span className="meta-chip" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "#4a5568", background: "#0d1117",
              border: "1px solid #1e2530", padding: "4px 12px", borderRadius: 8,
            }}>
              <FontAwesomeIcon icon={faCalendar} style={{ color: "#00E5FF", fontSize: 10 }} />
              {new Date(event.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
              {event.location && (
                  <span className="meta-chip" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 12, color: "#4a5568", background: "#0d1117",
                    border: "1px solid #1e2530", padding: "4px 12px", borderRadius: 8,
                  }}>
                <FontAwesomeIcon icon={faMapPin} style={{ color: "#00E5FF", fontSize: 10 }} />
                    {event.location}
              </span>
              )}
            </div>
          </header>

          {/* ── CTAs ── */}
          <div style={{ display: "flex", gap: 12, marginBottom: 56 }}>
            <Link href={`/events/${slug}/sessions`} className="cta-primary" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 20px", borderRadius: 8,
              background: "#00E5FF", color: "#000",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              Toutes les sessions
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 10 }} />
            </Link>
            <Link href={`/events/${slug}/rooms`} className="cta-secondary" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 20px", borderRadius: 8,
              border: "1px solid #1e2530", color: "#4a5568",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              Voir les salles
            </Link>
          </div>

          {/* ── Sessions heading ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4a5568", fontWeight: 600, whiteSpace: "nowrap" }}>
            Sessions
          </span>
            <span className="count-badge">{event.sessions.length}</span>
            <div className="divider-line" />
          </div>

          {/* ── Session list ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {event.sessions.map((session, i) => (
                <Link
                    key={session.id}
                    href={`/events/${slug}/sessions/${session.slug}`}
                    className="session-card"
                    style={{
                      display: "flex", flexDirection: "row",
                      borderRadius: 18, border: "1px solid #1e2530",
                      background: "#0d1117", padding: 20,
                      textDecoration: "none",
                      animationDelay: `${140 + i * 45}ms`,
                    }}
                >
                  {/* Icon */}
                  <div className="clock-wrap" style={{
                    width: 48, height: 48, flexShrink: 0,
                    border: "1px solid #1e2530", background: "#080b10",
                    borderRadius: 12, marginTop: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FontAwesomeIcon icon={faClock} className="clock-icon" style={{ fontSize: 16, color: "#2a3545" }} />
                  </div>

                  {/* Content */}
                  <div style={{ padding: "0 20px", flex: 1, minWidth: 0 }}>
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
                        <p style={{ fontSize: 11, color: "#3a4a5a", marginTop: 5, margin: "5px 0 0" }}>
                          {session.speakers.map((s) => s.fullName).join(", ")}
                        </p>
                    )}

                    <TimeProgress start={session.startTime} end={session.endTime} />
                  </div>

                  <FontAwesomeIcon
                      icon={faChevronRight}
                      className="session-arrow"
                      style={{ flexShrink: 0, fontSize: 11, marginTop: 8, alignSelf: "flex-start" }}
                  />
                </Link>
            ))}
          </div>

        </div>
      </main>
  );
}