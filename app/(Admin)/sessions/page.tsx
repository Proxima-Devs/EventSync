"use client";

import { useState } from "react";

export default function SessionsPage() {
    const [title, setTitle] = useState("");

    const createSession = async () => {
        await fetch("/api/sessions", {
            method: "POST",
            body: JSON.stringify({
                title,
                startTime: new Date(),
                endTime: new Date(),
                eventId: "ID_EVENT",
                speakerId: "ID_SPEAKER",
                roomId: "ID_ROOM",
            }),
        });
    };

    return (
        <div>
            <h1>Sessions</h1>

            <input onChange={(e) => setTitle(e.target.value)} />
            <button onClick={createSession}>Créer session</button>
        </div>
    );
}