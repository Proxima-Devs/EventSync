const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function getEvents() {
  const res = await fetch(`${API_URL}/api/events`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function getEventById(id: number) {
  const res = await fetch(`${API_URL}/api/events/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}