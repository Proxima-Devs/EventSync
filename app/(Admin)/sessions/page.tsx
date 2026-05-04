"use client";

import { useEffect, useState } from "react";

type Session = {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    isLive: boolean;
    event?: {
        id: string;
        title: string;
        slug: string;
    };
    room?: {
        id: string;
        name: string;
    };
    speakers?: {
        id: string;
        fullName: string;
        photo?: string;
    }[];
    _count?: {
        questions: number;
    };
};

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [title, setTitle] = useState("");

    // ── LOAD LIVE SESSIONS
    const loadSessions = async () => {
        const res = await fetch("/api/sessions/live");
        const data = await res.json();

        setSessions(data.sessions);
    };

    useEffect(() => {
        loadSessions();

        // 🔥 refresh automatique (toutes les 10s)
        const interval = setInterval(loadSessions, 10000);

        return () => clearInterval(interval);
    }, []);

    // ── CREATE SESSION
    const createSession = async () => {
        if (!title) return;

        await fetch("/api/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000), // +1h
                eventId: "EVENT_ID_HERE",
                roomId: "ROOM_ID_HERE",
                speakerIds: [], // optionnel
            }),
        });

        setTitle("");
        loadSessions();
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>🔥 Sessions Dashboard</h1>

            {/* ── CREATE SESSION */}
            <div style={{ marginBottom: 20 }}>
                <input
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTitle(e.target.value)
                    }
                    placeholder="Titre session"
                    style={{ marginRight: 10 }}
                />

                <button onClick={createSession}>
                    Créer session
                </button>
            </div>

            {/* ── LIVE LIST */}
            <h2>🟢 Sessions en cours</h2>

            {sessions.length === 0 && (
                <p>Aucune session en cours</p>
            )}

            {sessions.map((s) => (
                <div
                    key={s.id}
                    style={{
                        border: "1px solid #ddd",
                        padding: 10,
                        marginBottom: 10,
                        borderRadius: 8,
                    }}
                >
                    <h3>
                        {s.title} {s.isLive && "🟢 LIVE"}
                    </h3>

                    <p>
                        📅 {new Date(s.startTime).toLocaleString()} →{" "}
                        {new Date(s.endTime).toLocaleString()}
                    </p>

                    <p>🎯 Event: {s.event?.title}</p>
                    <p>🏛 Room: {s.room?.name}</p>

                    <p>
                        👥 Speakers:{" "}
                        {s.speakers?.length
                            ? s.speakers.map((sp) => sp.fullName).join(", ")
                            : "Aucun"}
                    </p>

                    <p>❓ Questions: {s._count?.questions ?? 0}</p>
                </div>
            ))}
        </div>
    );
}