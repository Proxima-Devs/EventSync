"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, AlertTriangle, Save } from "lucide-react";

interface Speaker {
  id: string;
  fullName: string;
  photo?: string | null;
}

interface Room {
  id: string;
  name: string;
}

interface Session {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  capacity?: number | null;
  room?: Room | null;
  speakers: Speaker[];
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-[#060a0f] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#2a3a4a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all duration-200";

function toDatetimeLocal(iso: string) {
  return new Date(iso).toISOString().slice(0, 16);
}

export default function EditSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    capacity: "",
    roomId: "",
    speakerIds: [] as string[],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [sessionRes, speakersRes, roomsRes] = await Promise.all([
          fetch(`/api/sessions/${sessionId}`),
          fetch("/api/speakers"),
          fetch("/api/rooms"),
        ]);

        if (!sessionRes.ok) throw new Error("Session not found");

        const [sessionData, speakersData, roomsData] = await Promise.all([
          sessionRes.json(),
          speakersRes.json(),
          roomsRes.json(),
        ]);

        setSession(sessionData);
        setSpeakers(Array.isArray(speakersData) ? speakersData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);

        setForm({
          title: sessionData.title,
          description: sessionData.description ?? "",
          startTime: toDatetimeLocal(sessionData.startTime),
          endTime: toDatetimeLocal(sessionData.endTime),
          capacity: sessionData.capacity?.toString() ?? "",
          roomId: sessionData.room?.id ?? "",
          speakerIds: sessionData.speakers.map((s: Speaker) => s.id),
        });
      } catch {
        setError("Impossible de charger la session.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId]);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleSpeaker = (id: string) => {
    setForm((f) => ({
      ...f,
      speakerIds: f.speakerIds.includes(id)
        ? f.speakerIds.filter((s) => s !== id)
        : [...f.speakerIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.startTime || !form.endTime) {
      setError("Titre, heure de début et heure de fin sont obligatoires.");
      return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setError("L'heure de début doit être antérieure à l'heure de fin.");
      return;
    }
    if (form.speakerIds.length === 0) {
      setError("Sélectionnez au moins un intervenant.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          startTime: form.startTime,
          endTime: form.endTime,
          capacity: form.capacity ? Number(form.capacity) : undefined,
          roomId: form.roomId || undefined,
          speakerIds: form.speakerIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");

      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-[#1e2530] rounded-lg animate-pulse" />
          <div className="h-32 bg-[#1e2530] rounded-lg animate-pulse" />
        </div>
      </main>
    );
  }

  if (error && !session) {
    return (
      <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8 flex-wrap">
        <Link href="/admin" className="hover:text-[#00E5FF] transition-colors">
          Admin
        </Link>
        <ChevronRight size={13} />
        <Link href="/admin/events" className="hover:text-[#00E5FF] transition-colors">
          Événements
        </Link>
        <ChevronRight size={13} />
        <span className="text-white truncate">Édition session</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">{session?.title}</h1>
        <p className="text-[#4a5568]">Modifiez les informations de la session.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
            Titre <span className="text-[#00E5FF]">*</span>
          </label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Titre de la session"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
            Description
          </label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Décrivez la session…"
          />
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
              Début <span className="text-[#00E5FF]">*</span>
            </label>
            <input
              className={inputClass}
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
              Fin <span className="text-[#00E5FF]">*</span>
            </label>
            <input
              className={inputClass}
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
            />
          </div>
        </div>

        {/* Room & Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
              Salle
            </label>
            <select
              className={inputClass}
              value={form.roomId}
              onChange={(e) => set("roomId", e.target.value)}
            >
              <option value="">— Sans salle —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
              Capacité
            </label>
            <input
              className={inputClass}
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="Ex : 150"
            />
          </div>
        </div>

        {/* Speakers */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
            Intervenants <span className="text-[#00E5FF]">*</span>
          </label>
          {speakers.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-amber-900/40 bg-amber-500/10 text-amber-400 text-sm">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Aucun intervenant. Créez-en un d'abord.</span>
            </div>
          ) : (
            <div className="rounded-xl border border-[#1e2530] bg-[#060a0f] divide-y divide-[#1e2530]">
              {speakers.map((sp) => {
                const checked = form.speakerIds.includes(sp.id);
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => toggleSpeaker(sp.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                      checked ? "bg-[#00E5FF08]" : "hover:bg-[#ffffff04]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="w-4 h-4"
                    />
                    <span className="flex-1">{sp.fullName}</span>
                  </button>
                );
              })}
            </div>
          )}
          {form.speakerIds.length > 0 && (
            <p className="text-xs text-[#00E5FF]">
              {form.speakerIds.length} intervenant{form.speakerIds.length !== 1 ? "s" : ""} sélectionné{form.speakerIds.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-900/60 bg-red-500/10 text-red-400 text-sm">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#1e2530]">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white font-semibold transition-all"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      </form>
    </main>
  );
}
