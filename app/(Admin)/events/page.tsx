"use client";

import { useEffect, useState } from "react";

export default function AdminEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [title, setTitle] = useState("");

    const load = () => {
        fetch("/api/events")
            .then(res => res.json())
            .then(setEvents);
    };

    useEffect(load, []);

    const createEvent = async () => {
        await fetch("/api/events", {
            method: "POST",
            body: JSON.stringify({ title, date: new Date() }),
        });
        load();
    };

    const deleteEvent = async (id: string) => {
        await fetch("/api/events", {
            method: "DELETE",
            body: JSON.stringify({ id }),
        });
        load();
    };

    return (
        <div>
            <h1>Admin Events</h1>

            <input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                }
            />
            <button onClick={createEvent}>Créer</button>

            {events.map(e => (
                <div key={e.id}>
                    {e.title}
                    <button onClick={() => deleteEvent(e.id)}>Supprimer</button>
                </div>
            ))}
        </div>
    );
}