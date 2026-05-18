"use client";

import { Mic, Plus, X, Pencil, Trash2, Layers, AlertTriangle, ChevronRight, Search } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// ─── Types ───

interface SpeakerLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

interface Speaker {
  id: string;
  fullName: string;
  photo?: string | null;
  bio?: string | null;
  links?: SpeakerLinks | null;
  _count: { sessions: number };
}

interface SpeakerFormData {
  fullName: string;
  photo: string;
  bio: string;
  twitter: string;
  linkedin: string;
  website: string;
  github: string;
}

// ─── Style ───

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-[#060a0f] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#2a3a4a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all duration-200";

// ─── Skeleton ───

function SpeakerRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-6 py-5 border-b border-[#1e2530]">
      <div className="w-10 h-10 rounded-full bg-[#1e2530] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 bg-[#1e2530] rounded-lg" />
        <div className="h-2.5 w-1/4 bg-[#1e2530] rounded-lg" />
      </div>
      <div className="flex gap-2 ml-auto">
        <div className="w-8 h-8 bg-[#1e2530] rounded-xl" />
        <div className="w-8 h-8 bg-[#1e2530] rounded-xl" />
      </div>
    </div>
  );
}

// ─── Speaker Modal (Create / Edit) ───

function SpeakerModal({
  open,
  onClose,
  onSaved,
  editingSpeaker,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (speaker: Speaker) => void;
  editingSpeaker: Speaker | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = !!editingSpeaker;
  const [form, setForm] = useState<SpeakerFormData>({
    fullName: "",
    photo: "",
    bio: "",
    twitter: "",
    linkedin: "",
    website: "",
    github: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (editingSpeaker) {
        const links = editingSpeaker.links || {};
        setForm({
          fullName: editingSpeaker.fullName,
          photo: editingSpeaker.photo ?? "",
          bio: editingSpeaker.bio ?? "",
          twitter: links.twitter ?? "",
          linkedin: links.linkedin ?? "",
          website: links.website ?? "",
          github: links.github ?? "",
        });
      } else {
        setForm({
          fullName: "",
          photo: "",
          bio: "",
          twitter: "",
          linkedin: "",
          website: "",
          github: "",
        });
      }
      setError("");
    }
  }, [open, editingSpeaker]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = (field: keyof SpeakerFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Le nom complet est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      const links: SpeakerLinks = {};
      if (form.twitter) links.twitter = form.twitter;
      if (form.linkedin) links.linkedin = form.linkedin;
      if (form.website) links.website = form.website;
      if (form.github) links.github = form.github;

      const url = isEdit ? `/api/speakers/${editingSpeaker!.id}` : "/api/speakers";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          photo: form.photo || undefined,
          bio: form.bio || undefined,
          links: Object.keys(links).length > 0 ? links : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      onSaved({ _count: { sessions: 0 }, ...data });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/75 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-[#1e2530] bg-[#0a0e14] overflow-hidden my-auto"
            style={{
              boxShadow:
                "0 0 0 1px #00E5FF18, 0 0 40px #00E5FF18, 0 0 80px #00E5FF08, 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top neon line */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF60] to-transparent" />
            <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 bg-[#00E5FF08] rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e2530]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                  {isEdit ? (
                    <Pencil size={12} className="text-[#00E5FF]" />
                  ) : (
                    <Plus size={12} className="text-[#00E5FF]" strokeWidth={3} />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">
                    {isEdit ? "Modifier l'intervenant" : "Nouvel intervenant"}
                  </h2>
                  <p className="text-xs text-[#3a4a5a]">
                    {isEdit ? `ID : ${editingSpeaker?.id.slice(0, 8)}…` : "Ajoutez un conférencier"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#2e3a4a] transition-all duration-200"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative px-6 py-5 flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
                  Nom complet <span className="text-[#00E5FF]">*</span>
                </label>
                <input
                  className={inputClass}
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Ex : Jean Dupont"
                  autoFocus
                />
              </div>

              {/* Photo URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
                  Photo (URL)
                </label>
                <input
                  className={inputClass}
                  type="url"
                  value={form.photo}
                  onChange={(e) => set("photo", e.target.value)}
                  placeholder="https://…"
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
                  Biographie
                </label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Décrivez l'intervenant…"
                />
              </div>

              {/* Social Links */}
              <div className="border-t border-[#1e2530] pt-4 mt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-3">
                  Liens sociaux (optionnel)
                </p>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#2a3a4a]">Twitter</label>
                    <input
                      className={inputClass}
                      value={form.twitter}
                      onChange={(e) => set("twitter", e.target.value)}
                      placeholder="https://twitter.com/…"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#2a3a4a]">LinkedIn</label>
                    <input
                      className={inputClass}
                      value={form.linkedin}
                      onChange={(e) => set("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/…"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#2a3a4a]">Website</label>
                    <input
                      className={inputClass}
                      type="url"
                      value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#2a3a4a]">GitHub</label>
                    <input
                      className={inputClass}
                      value={form.github}
                      onChange={(e) => set("github", e.target.value)}
                      placeholder="https://github.com/…"
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 rounded-xl border border-red-900/60 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-3 border-t border-[#1e2530] mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white hover:border-[#2e3a4a] transition-all duration-200 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: "0 0 20px #00E5FF30" }}
                >
                  {loading
                    ? isEdit ? "Sauvegarde…" : "Création…"
                    : isEdit ? "Sauvegarder" : "Créer l'intervenant"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Modal ───

function DeleteModal({
  speaker,
  onClose,
  onDeleted,
}: {
  speaker: Speaker | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (speaker) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [speaker, onClose]);

  const handleDelete = async () => {
    if (!speaker) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/speakers/${speaker.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la suppression");
      }
      onDeleted(speaker.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {speaker && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-2xl border border-red-900/40 bg-[#0a0e14] overflow-hidden"
            style={{
              boxShadow:
                "0 0 0 1px #ff444418, 0 0 40px #ff444412, 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="px-6 pt-6 pb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-900/40 flex items-center justify-center mb-4">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <h2 className="text-base font-black text-white mb-1">Supprimer l'intervenant ?</h2>
              <p className="text-sm text-[#4a5568] leading-relaxed">
                <span className="text-[#ccc] font-semibold">{speaker.fullName}</span> sera supprimé(e).
                {speaker._count.sessions > 0 && (
                  <span className="text-amber-400 block mt-1.5">
                    ⚠️ {speaker._count.sessions} session{speaker._count.sessions !== 1 ? "s" : ""} associée{speaker._count.sessions !== 1 ? "s" : ""} seront dissociées.
                  </span>
                )}
              </p>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-900/40 rounded-xl px-3 py-2">
                  <AlertTriangle size={13} className="shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white hover:border-[#2e3a4a] transition-all duration-200 font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-black tracking-wide hover:bg-red-500 active:scale-95 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Speaker Row ───

function SpeakerRow({
  speaker,
  onEdit,
  onDelete,
}: {
  speaker: Speaker;
  onEdit: (s: Speaker) => void;
  onDelete: (s: Speaker) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-4 px-6 py-4 border-b border-[#1e2530] hover:bg-[#ffffff03] transition-colors"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#ffffff06] border border-[#1e2530] flex items-center justify-center shrink-0 group-hover:border-[#00E5FF22] transition-colors overflow-hidden">
        {speaker.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={speaker.photo} alt={speaker.fullName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[#3a4a5a] group-hover:text-[#00E5FF] text-sm font-black transition-colors">
            {speaker.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="font-bold text-[#eee] text-sm truncate block">{speaker.fullName}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Layers size={10} className="text-[#3a4a5a]" />
          <span className="text-[11px] text-[#3a4a5a]">
            {speaker._count.sessions} session{speaker._count.sessions !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Sessions badge */}
      {speaker._count.sessions > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#ffffff04]">
          <Layers size={11} className="text-[#3a4a5a]" />
          <span className="text-xs text-[#3a4a5a] font-semibold">
            {speaker._count.sessions} session{speaker._count.sessions !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onEdit(speaker)}
          className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#2e3a4a] transition-all duration-200"
          title="Modifier"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(speaker)}
          className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-red-400 hover:border-red-900/50 transition-all duration-200"
          title="Supprimer"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [deletingSpeaker, setDeletingSpeaker] = useState<Speaker | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/speakers");
      const data = await res.json();
      setSpeakers(Array.isArray(data) ? data : []);
    } catch {
      setError("Erreur lors du chargement des intervenants.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingSpeaker(null);
    setModalOpen(true);
  };

  const openEdit = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setModalOpen(true);
  };

  const handleSaved = (saved: Speaker) => {
    setSpeakers((prev) => {
      const exists = prev.find((s) => s.id === saved.id);
      if (exists) return prev.map((s) => (s.id === saved.id ? { ...s, ...saved } : s));
      return [...prev, saved];
    });
  };

  const handleDeleted = (id: string) => {
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
  };

  const filtered = speakers.filter((s) => {
    const q = search.trim().toLowerCase();
    return !q || s.fullName.toLowerCase().includes(q);
  });

  const totalSessions = speakers.reduce((sum, s) => sum + s._count.sessions, 0);

  return (
    <>
      <SpeakerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        editingSpeaker={editingSpeaker}
      />
      <DeleteModal
        speaker={deletingSpeaker}
        onClose={() => setDeletingSpeaker(null)}
        onDeleted={handleDeleted}
      />

      <main className="flex-1 px-8 py-12 max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8">
          <Link href="/admin" className="hover:text-[#00E5FF] transition-colors">
            Admin
          </Link>
          <ChevronRight size={13} />
          <span className="text-white">Intervenants</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                <Mic size={16} className="text-[#00E5FF]" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Intervenants
                {!loading && speakers.length > 0 && (
                  <span className="ml-3 text-base font-normal text-[#3a4a5a]">{speakers.length}</span>
                )}
              </h1>
            </div>
            <p className="text-sm text-[#4a5568] ml-11">
              Gérez les conférenciers et leurs profils publics.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200"
            style={{ boxShadow: "0 0 24px #00E5FF30" }}
          >
            <Plus size={15} strokeWidth={3} />
            Ajouter un intervenant
          </button>
        </div>

        {/* Mini stats + search */}
        {!loading && speakers.length > 0 && (
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <Mic size={11} className="text-[#3a4a5a]" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {speakers.length} intervenant{speakers.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <Layers size={11} className="text-[#3a4a5a]" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {totalSessions} session{totalSessions !== 1 ? "s" : ""} au total
              </span>
            </div>

            <div className="relative ml-auto">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a4a5a] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 pl-9 pr-4 py-2 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-[#1e2530] bg-[#060a0f]">
            <div className="w-10 shrink-0" />
            <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-[#2a3a4a]">
              Intervenant
            </span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-[#2a3a4a]">
              Sessions
            </span>
            <span className="w-20 shrink-0" />
          </div>

          {/* Loading */}
          {loading &&
            Array.from({ length: 4 }).map((_, i) => <SpeakerRowSkeleton key={i} />)}

          {/* Error */}
          {error && (
            <div className="px-6 py-10 flex items-center justify-center gap-2 text-red-400 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && speakers.length === 0 && (
            <div className="py-20 text-center">
              <Mic size={28} className="mx-auto text-[#1e2530] mb-3" />
              <p className="text-[#3a4a5a] italic text-sm mb-4">
                Aucun intervenant pour le moment.
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] text-[#00E5FF] text-sm font-bold hover:bg-[#00E5FF20] transition-all"
              >
                <Plus size={13} />
                Créer le premier intervenant
              </button>
            </div>
          )}

          {/* No search results */}
          {!loading && !error && speakers.length > 0 && filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#3a4a5a] italic text-sm">
                Aucun intervenant ne correspond à «&nbsp;{search}&nbsp;».
              </p>
            </div>
          )}

          {/* Rows */}
          <AnimatePresence initial={false}>
            {filtered.map((speaker) => (
              <SpeakerRow
                key={speaker.id}
                speaker={speaker}
                onEdit={openEdit}
                onDelete={(s) => setDeletingSpeaker(s)}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
