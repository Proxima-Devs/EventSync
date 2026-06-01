"use client";

import { Mic, Plus, X, Pencil, Trash2, Layers, AlertTriangle, ChevronRight, Search } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SpeakerLinks } from "@/types";
import FileUpload from "@/components/FileUpload";
import { SpeakerCard } from "@/components/SpeakerCard";

// ─── Types ───

interface Speaker {
  id: string;
  slug?: string;
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

function SpeakerCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col rounded-2xl border border-[#1e2530] bg-[#0d1117] overflow-hidden">
      <div className="flex flex-col items-center pt-7 pb-5 px-5 flex-1">
        <div className="w-20 h-20 rounded-full bg-[#1e2530] mb-4" />
        <div className="h-3.5 w-2/3 bg-[#1e2530] rounded-lg mb-2" />
        <div className="h-2.5 w-1/3 bg-[#1e2530] rounded-lg mb-4" />
        <div className="space-y-1.5 w-full">
          <div className="h-2 bg-[#1e2530] rounded-lg w-full" />
          <div className="h-2 bg-[#1e2530] rounded-lg w-4/5 mx-auto" />
          <div className="h-2 bg-[#1e2530] rounded-lg w-3/5 mx-auto" />
        </div>
      </div>
      <div className="flex gap-2 px-4 py-3 border-t border-[#1e2530] bg-[#060a0f]">
        <div className="flex-1 h-8 bg-[#1e2530] rounded-xl" />
        <div className="flex-1 h-8 bg-[#1e2530] rounded-xl" />
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
  const t = useTranslations("AdminSpeakersPage");
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
      setError(t("modal.nameRequired"));
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
      if (!res.ok) throw new Error(data.error ?? t("errors.server"));
      onSaved({ _count: { sessions: 0 }, ...data });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errors.unknown"));
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
                    {isEdit ? t("modal.editTitle") : t("modal.createTitle")}
                  </h2>
                  <p className="text-xs text-[#3a4a5a]">
                    {isEdit
                      ? t("modal.editSubtitle", { id: editingSpeaker?.id.slice(0, 8) ?? "" })
                      : t("modal.createSubtitle")}
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

              {/* Photo upload — avatar centré en haut */}
              <div className="flex flex-col items-center pt-1 pb-2 border-b border-[#1e2530]">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-3">
                  {t("modal.photoLabel")}
                </label>
                <FileUpload
                  value={form.photo}
                  onChange={(url) => set("photo", url)}
                />
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
                  {t("modal.fullNameLabel")} <span className="text-[#00E5FF]">*</span>
                </label>
                <input
                  className={inputClass}
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder={t("modal.fullNamePlaceholder")}
                  autoFocus
                />
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
                  {t("modal.bioLabel")}
                </label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder={t("modal.bioPlaceholder")}
                />
              </div>

              {/* Social Links */}
              <div className="border-t border-[#1e2530] pt-4 mt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-3">
                  {t("modal.socialTitle")}
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
                  {t("modal.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: "0 0 20px #00E5FF30" }}
                >
                  {loading
                    ? isEdit
                      ? t("modal.saving")
                      : t("modal.creating")
                    : isEdit
                      ? t("modal.save")
                      : t("modal.create")}
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
  const t = useTranslations("AdminSpeakersPage");
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
        throw new Error(data.error ?? t("deleteModal.deleteError"));
      }
      onDeleted(speaker.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errors.unknown"));
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
              <h2 className="text-base font-black text-white mb-1">{t("deleteModal.title")}</h2>
              <p className="text-sm text-[#4a5568] leading-relaxed">
                {t("deleteModal.body", { name: speaker.fullName })}
                {speaker._count.sessions > 0 && (
                  <span className="text-amber-400 block mt-1.5">
                    {t("deleteModal.sessionsWarning", { count: speaker._count.sessions })}
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
                {t("deleteModal.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-black tracking-wide hover:bg-red-500 active:scale-95 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? t("deleteModal.deleting") : t("deleteModal.confirm")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ───

export default function AdminSpeakersPage() {
  const t = useTranslations("AdminSpeakersPage");
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
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    (async () => {
      await load();
    })();
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

      <main className="flex-1 px-8 py-12 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8">
          <Link href="/" className="hover:text-[#00E5FF] transition-colors">
            {t("breadcrumbHome")}
          </Link>
          <ChevronRight size={13} />
          <span className="text-white">{t("breadcrumbSpeakers")}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                <Mic size={16} className="text-[#00E5FF]" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {t("pageTitle")}
              </h1>
            </div>
            <p className="text-sm text-[#4a5568] ml-11">
              {t("pageDescription")}
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200"
            style={{ boxShadow: "0 0 24px #00E5FF30" }}
          >
            <Plus size={15} strokeWidth={3} />
            {t("addSpeaker")}
          </button>
        </div>

        {/* Mini stats + search */}
        {!loading && speakers.length > 0 && (
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <Mic size={11} className="text-[#3a4a5a]" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {t("speakerCount", { count: speakers.length })}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <Layers size={11} className="text-[#3a4a5a]" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {t("totalSessions", { count: totalSessions })}
              </span>
            </div>

            <div className="relative ml-auto">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a4a5a] pointer-events-none"
              />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 pl-9 pr-4 py-2 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
              />
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SpeakerCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-2 py-20 text-red-400 text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && speakers.length === 0 && (
          <div className="py-20 text-center">
            <Mic size={28} className="mx-auto text-[#1e2530] mb-3" />
            <p className="text-[#3a4a5a] italic text-sm mb-4">
              {t("emptyState")}
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] text-[#00E5FF] text-sm font-bold hover:bg-[#00E5FF20] transition-all"
            >
              <Plus size={13} />
              {t("createFirst")}
            </button>
          </div>
        )}

        {/* No search results */}
        {!loading && !error && speakers.length > 0 && filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-[#3a4a5a] italic text-sm">
              {t("noSearchResults", { query: search })}
            </p>
          </div>
        )}

        {/* Cards grid — 4 columns */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence initial={false}>
              {filtered.map((speaker) => (
                <SpeakerCard
                  key={speaker.id}
                  speaker={speaker}
                  onEdit={openEdit}
                  onDelete={(s) => setDeletingSpeaker(s)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </>
  );
}