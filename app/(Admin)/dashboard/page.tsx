"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then(res => res.json())
            .then(setStats);
    }, []);

    if (!stats) return <p>Loading...</p>;

    return (
        <div>
            <h1>Dashboard</h1>

            <p>Events: {stats.totals.events}</p>
            <p>Sessions: {stats.totals.sessions}</p>
            <p>Speakers: {stats.totals.speakers}</p>
        </div>
    );
}