"use client";

import { useEffect, useState } from "react";

type Event = {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
};

export default function AdminEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [title, setTitle] = useState("");

    // ── CHARGER LES EVENTS
    const load = async () => {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data.data); // IMPORTANT: ton API retourne { data, meta }
    };

    useEffect(() => {
        load();
    }, []);

    // ── CRÉER EVENT
    const createEvent = async () => {
        if (!title) return;

        await fetch("/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                description: "",
                startDate: new Date(),
                endDate: new Date(Date.now() + 3600000), // +1h
                location: "",
                coverImage: "",
            }),
        });

        setTitle("");
        load();
    };

    // ── SUPPRIMER EVENT
    const deleteEvent = async (id: string) => {
        await fetch("/api/events", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });

        load();
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Admin Events</h1>

            {/* INPUT */}
            <input
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                }
                placeholder="Titre de l'événement"
            />

            <button onClick={createEvent}>Créer</button>

            {/* LISTE */}
            <div style={{ marginTop: 20 }}>
                {events.map((e) => (
                    <div
                        key={e.id}
                        style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            marginBottom: 10,
                        }}
                    >
                        <div>
                            <strong>{e.title}</strong>
                        </div>

                        <button onClick={() => deleteEvent(e.id)}>
                            Supprimer
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}