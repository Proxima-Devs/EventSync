"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";
import {
  Users,
  Plus,
  X,
  Pencil,
  Trash2,
  Mic,
  AlertTriangle,
  ChevronRight,
  Search,
  Globe,
  Ghost
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpeakerLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface Speaker {
  id: string;
  fullName: string;
  photo?: string | null;
  bio?: string | null;
  links?: SpeakerLinks | null;
  _count: { sessions: number };
}

interface FormState {
  fullName: string;
  bio: string;
  photo: string;
  twitter: string;
  linkedin: string;
  github: string;
  website: string;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  bio: "",
  photo: "",
  twitter: "",
  linkedin: "",
  github: "",
  website: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-[#060a0f] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#2a3a4a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all duration-200";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
        {label}
        {required && <span className="text-[#00E5FF] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SpeakerRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-6 py-5 border-b border-[#1e2530]">
      <div className="w-10 h-10 rounded-full bg-[#1e2530] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 bg-[#1e2530] rounded-lg" />
        <div className="h-2.5 w-2/3 bg-[#1e2530] rounded-lg" />
      </div>
      <div className="h-3 w-16 bg-[#1e2530] rounded-lg hidden sm:block" />
      <div className="flex gap-2 ml-auto">
        <div className="w-8 h-8 bg-[#1e2530] rounded-xl" />
        <div className="w-8 h-8 bg-[#1e2530] rounded-xl" />
      </div>
    </div>
  );
}

// ─── Social icon map ──────────────────────────────────────────────────────────

const SOCIAL_META: Record<
  string,
  { label: string; placeholder: string; icon: React.ReactNode }
> = {
  twitter: {
    label: "Twitter / X",
    placeholder: "https://x.com/username",
    icon: <span className="text-[11px] font-black">𝕏</span>,
  },
  linkedin: {
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    icon: <span className="text-[11px] font-black">in</span>,
  },
  github: {
    label: "GitHub",
    placeholder: "https://github.com/username",
    icon: <Ghost size={12} />,
  },
  website: {
    label: "Site web",
    placeholder: "https://monsite.com",
    icon: <Globe size={12} />,
  },
};

// ─── Speaker Modal (Create / Edit) ───────────────────────────────────────────

function SpeakerModal({
  open,
  onClose,
  onSaved,
  editingSpeaker,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (sp: Speaker) => void;
  editingSpeaker: Speaker | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = !!editingSpeaker;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEditingSpeaker, setPrevEditingSpeaker] = useState(editingSpeaker);

  if (open !== prevOpen || editingSpeaker !== prevEditingSpeaker) {
    setPrevOpen(open);
    setPrevEditingSpeaker(editingSpeaker);
    if (open) {
      setForm(editingSpeaker ? {
        fullName: editingSpeaker.fullName,
        bio: editingSpeaker.bio ?? "",
        photo: editingSpeaker.photo ?? "",
        twitter: editingSpeaker.links?.twitter ?? "",
        linkedin: editingSpeaker.links?.linkedin ?? "",
        github: editingSpeaker.links?.github ?? "",
        website: editingSpeaker.links?.website ?? "",
      } : EMPTY_FORM);
      setError("");
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = (field: keyof FormState, value: string) =>
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
      const payload = {
        fullName: form.fullName.trim(),
        bio: form.bio.trim() || undefined,
        photo: form.photo || undefined,
        links: {
          ...(form.twitter && { twitter: form.twitter }),
          ...(form.linkedin && { linkedin: form.linkedin }),
          ...(form.github && { github: form.github }),
          ...(form.website && { website: form.website }),
        },
      };
      const url = isEdit ? `/api/speakers/${editingSpeaker!.id}` : "/api/speakers";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");

      onSaved({ _count: { sessions: editingSpeaker?._count.sessions ?? 0 }, ...data });
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
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl rounded-2xl border border-[#1e2530] bg-[#0a0e14] overflow-hidden max-h-[90vh] flex flex-col"
            style={{
              boxShadow:
                "0 0 0 1px #00E5FF18, 0 0 40px #00E5FF18, 0 0 80px #00E5FF08, 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Neon top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF60] to-transparent" />
            <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 bg-[#00E5FF08] rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e2530] shrink-0">
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
                    {isEdit ? editingSpeaker?.fullName : "Renseignez les informations"}
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

            {/* Scrollable body */}
            <form onSubmit={handleSubmit} className="relative flex flex-col overflow-hidden flex-1">
              <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

                {/* Photo + Name side by side */}
                <div className="flex gap-4 items-start">
                  {/* Avatar preview */}
                  <div className="shrink-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-2">
                      Photo
                    </p>
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#1e2530] bg-[#060a0f] flex items-center justify-center">
                      {form.photo ? (
                        <img
                          src={form.photo}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-black text-[#2a3a4a]">
                          {form.fullName ? initials(form.fullName) : "?"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name + bio */}
                  <div className="flex-1 flex flex-col gap-3">
                    <Field label="Nom complet" required>
                      <input
                        className={inputClass}
                        value={form.fullName}
                        onChange={(e) => set("fullName", e.target.value)}
                        placeholder="Ex : Marie Dupont"
                        autoFocus
                      />
                    </Field>
                  </div>
                </div>

                {/* Image upload */}
                <Field label="Upload photo">
                  <div className="rounded-xl border border-[#1e2530] bg-[#060a0f] p-3">
                    <ImageUpload
                      value={form.photo}
                      onChange={(url) => set("photo", url)}
                    />
                  </div>
                </Field>

                {/* Bio */}
                <Field label="Biographie">
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={3}
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Quelques mots sur l'intervenant…"
                  />
                </Field>

                {/* Social links */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-3">
                    Liens sociaux
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(["twitter", "linkedin", "github", "website"] as const).map((field) => {
                      const meta = SOCIAL_META[field];
                      return (
                        <div key={field} className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-[#2a3a4a] flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-md bg-[#1e2530] flex items-center justify-center text-[#3a4a5a]">
                              {meta.icon}
                            </span>
                            {meta.label}
                          </label>
                          <input
                            className={inputClass}
                            value={form[field]}
                            onChange={(e) => set(field, e.target.value)}
                            placeholder={meta.placeholder}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Error */}
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
              </div>

              {/* Sticky footer */}
              <div className="px-6 pb-6 pt-4 border-t border-[#1e2530] bg-[#0a0e14] shrink-0 flex gap-3">
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

// ─── Delete Modal ─────────────────────────────────────────────────────────────

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
  const [prevSpeaker, setPrevSpeaker] = useState(speaker);

  if (speaker !== prevSpeaker) {
    setPrevSpeaker(speaker);
    setError("");
  }

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
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-900/40 flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-red-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Supprimer l'intervenant ?</h2>
                  <p className="text-xs text-[#3a4a5a]">Cette action est irréversible</p>
                </div>
              </div>

              {/* Speaker preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[#1e2530] bg-[#060a0f] mb-4">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#1e2530] bg-[#1e2530] flex items-center justify-center text-xs font-black text-[#3a4a5a] shrink-0">
                  {speaker.photo ? (
                    <img src={speaker.photo} alt={speaker.fullName} className="w-full h-full object-cover" />
                  ) : (
                    initials(speaker.fullName)
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#ccc]">{speaker.fullName}</p>
                  <p className="text-[11px] text-[#3a4a5a]">
                    {speaker._count.sessions} session{speaker._count.sessions !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {speaker._count.sessions > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-900/40 bg-amber-500/10 text-amber-400 text-xs mb-3">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>
                    Cet intervenant est assigné à {speaker._count.sessions} session{speaker._count.sessions !== 1 ? "s" : ""}. Retirez-le d'abord des sessions pour pouvoir le supprimer.
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-900/40 rounded-xl px-3 py-2">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
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
                disabled={loading || speaker._count.sessions > 0}
                className="flex-1 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-black tracking-wide hover:bg-red-500 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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

// ─── Speaker Row ──────────────────────────────────────────────────────────────

function SpeakerRow({
  speaker,
  onEdit,
  onDelete,
}: {
  speaker: Speaker;
  onEdit: (sp: Speaker) => void;
  onDelete: (sp: Speaker) => void;
}) {
  const links = speaker.links ?? {};
  const activeSocials = Object.entries(links).filter(([, v]) => !!v);

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
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1e2530] bg-[#ffffff06] flex items-center justify-center text-xs font-black text-[#3a4a5a] shrink-0 group-hover:border-[#00E5FF22] transition-colors">
        {speaker.photo ? (
          <Image
            src={speaker.photo}
            alt={speaker.fullName}
            width={40}
            height={40}
            unoptimized
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="group-hover:text-[#00E5FF] transition-colors">
            {initials(speaker.fullName)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-[#eee] text-sm truncate">{speaker.fullName}</span>
          {activeSocials.length > 0 && (
            <div className="flex gap-1">
              {activeSocials.slice(0, 3).map(([key]) => {
                const meta = SOCIAL_META[key];
                return (
                  <span
                    key={key}
                    className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full border border-[#1e2530] text-[#2a3a4a] font-bold"
                  >
                    {meta?.icon}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        {speaker.bio && (
          <p className="text-[11px] text-[#3a4a5a] truncate max-w-sm">
            {speaker.bio}
          </p>
        )}
      </div>

      {/* Sessions badge */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <Mic size={11} className="text-[#3a4a5a]" />
        <span className="text-xs text-[#3a4a5a] font-semibold">
          {speaker._count.sessions} session{speaker._count.sessions !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Public profile link */}
      <Link
        href={`/speakers/${speaker.id}`}
        target="_blank"
        className="hidden md:flex w-8 h-8 rounded-xl border border-[#1e2530] items-center justify-center text-[#3a4a5a] hover:text-[#00E5FF] hover:border-[#00E5FF33] transition-all duration-200"
        title="Voir le profil public"
      >
        <Globe size={13} />
      </Link>

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

// ─── Main Page ────────────────────────────────────────────────────────────────

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
    (async () => {
      await load();
    })();
  }, [load]);

  const openCreate = () => {
    setEditingSpeaker(null);
    setModalOpen(true);
  };

  const openEdit = (sp: Speaker) => {
    setEditingSpeaker(sp);
    setModalOpen(true);
  };

  const handleSaved = (saved: Speaker) => {
    setSpeakers((prev) => {
      const exists = prev.find((s) => s.id === saved.id);
      if (exists) return prev.map((s) => (s.id === saved.id ? { ...s, ...saved } : s));
      return [...prev, saved].sort((a, b) => a.fullName.localeCompare(b.fullName));
    });
  };

  const handleDeleted = (id: string) => {
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
  };

  const filtered = speakers.filter((s) => {
    const q = search.trim().toLowerCase();
    return !q || s.fullName.toLowerCase().includes(q) || s.bio?.toLowerCase().includes(q);
  });

  const totalSessions = speakers.reduce((sum, s) => sum + s._count.sessions, 0);
  const withPhoto = speakers.filter((s) => s.photo).length;

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

      <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">
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
                <Users size={16} className="text-[#00E5FF]" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Intervenants
                {!loading && speakers.length > 0 && (
                  <span className="ml-3 text-base font-normal text-[#3a4a5a]">{speakers.length}</span>
                )}
              </h1>
            </div>
            <p className="text-sm text-[#4a5568] ml-11">
              Gérez les profils des experts et conférenciers.
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
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <Users size={11} className="text-[#3a4a5a]" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {speakers.length} intervenant{speakers.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <Mic size={11} className="text-[#3a4a5a]" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {totalSessions} session{totalSessions !== 1 ? "s" : ""} au total
              </span>
            </div>
            {withPhoto > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-[#3a4a5a] font-semibold">
                  {withPhoto} avec photo
                </span>
              </div>
            )}

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
                className="w-52 pl-9 pr-4 py-2 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-[#1e2530] bg-[#060a0f]">
            <div className="w-10 shrink-0" />
            <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-[#2a3a4a]">Intervenant</span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-[#2a3a4a]">Sessions</span>
            <span className="w-30 shrink-0" />
          </div>

          {/* Loading */}
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <SpeakerRowSkeleton key={i} />)}

          {/* Error */}
          {error && (
            <div className="px-6 py-10 flex items-center justify-center gap-2 text-red-400 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Empty */}
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
                Ajouter le premier
              </button>
            </div>
          )}

          {/* No results */}
          {!loading && !error && speakers.length > 0 && filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#3a4a5a] italic text-sm">
                Aucun résultat pour «&nbsp;{search}&nbsp;».
              </p>
            </div>
          )}

          {/* Rows */}
          <AnimatePresence initial={false}>
            {filtered.map((sp) => (
              <SpeakerRow
                key={sp.id}
                speaker={sp}
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