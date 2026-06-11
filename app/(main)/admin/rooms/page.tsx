"use client";

import { Building2, Plus, X, Pencil, Trash2, Layers, AlertTriangle, ChevronRight, Search } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

// ─── Types ───

interface Room {
  id: string;
  name: string;
  _count: { sessions: number };
}

// ─── Input style ───

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-[#060a0f] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#2a3a4a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all duration-200";

// ─── Skeleton ───

function RoomRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-6 py-5 border-b border-[#1e2530]">
      <div className="w-10 h-10 rounded-xl bg-[#1e2530] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 bg-[#1e2530] rounded-lg" />
        <div className="h-2.5 w-1/5 bg-[#1e2530] rounded-lg" />
      </div>
      <div className="flex gap-2 ml-auto">
        <div className="w-8 h-8 bg-[#1e2530] rounded-xl" />
        <div className="w-8 h-8 bg-[#1e2530] rounded-xl" />
      </div>
    </div>
  );
}

// ─── Room Modal (Create / Edit) ───

function RoomModal({
  open,
  onClose,
  onSaved,
  editingRoom,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (room: Room) => void;
  editingRoom: Room | null;
}) {
  const t = useTranslations("AdminRoomsPage");
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = !!editingRoom;
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEditingRoom, setPrevEditingRoom] = useState(editingRoom);

  if (open !== prevOpen || editingRoom !== prevEditingRoom) {
    setPrevOpen(open);
    setPrevEditingRoom(editingRoom);
    
    if (open) {
      setName(editingRoom?.name ?? "");
      setError("");
    } else {
      setName("");
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError(t("modal.nameRequired"));
      return;
    }
    setLoading(true);
    try {
      const url = isEdit ? `/api/rooms/${editingRoom!.id}` : "/api/rooms";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
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
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-[#1e2530] bg-[#0a0e14] overflow-hidden"
            style={{
              boxShadow:
                "0 0 0 1px #00E5FF18, 0 0 40px #00E5FF18, 0 0 80px #00E5FF08, 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top neon line */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF60] to-transparent" />
            {/* Corner glow */}
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
                    {isEdit ? t("modal.editSubtitle", { id: editingRoom?.id.slice(0, 8) ?? "" }) : t("modal.createSubtitle")}
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
            <form
              onSubmit={handleSubmit}
              className="relative px-6 py-5 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
                  {t("modal.nameLabel")} <span className="text-[#00E5FF]">*</span>
                </label>
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("modal.namePlaceholder")}
                  autoFocus
                />
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

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                  }}
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
                    ? isEdit ? t("modal.saving") : t("modal.creating")
                    : isEdit ? t("modal.save") : t("modal.create")}
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
  room,
  onClose,
  onDeleted,
}: {
  room: Room | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const t = useTranslations("AdminRoomsPage");
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (room) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [room, onClose]);

  const handleDelete = async () => {
    if (!room) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${room.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t("deleteModal.deleteError"));
      }
      onDeleted(room.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errors.unknown"));
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {room && (
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
                {t("deleteModal.body", { name: room.name })}
                {room._count.sessions > 0 && (
                  <span className="text-amber-400 block mt-1.5">
                    {t("deleteModal.sessionsWarning", { count: room._count.sessions })}
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

// ─── Room Row ───

function RoomRow({
  room,
  onEdit,
  onDelete,
}: {
  room: Room;
  onEdit: (r: Room) => void;
  onDelete: (r: Room) => void;
}) {
  const t = useTranslations("AdminRoomsPage");
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-4 px-6 py-4 border-b border-[#1e2530] hover:bg-[#ffffff03] transition-colors"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-[#ffffff06] border border-[#1e2530] flex items-center justify-center shrink-0 group-hover:border-[#00E5FF22] transition-colors">
        <Building2 size={16} className="text-[#3a4a5a] group-hover:text-[#00E5FF] transition-colors" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="font-bold text-[#eee] text-sm truncate block">{room.name}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Layers size={10} className="text-[#3a4a5a]" />
          <span className="text-[11px] text-[#3a4a5a]">
            {t("sessionsCount", { count: room._count.sessions })}
          </span>
        </div>
      </div>

      {room._count.sessions > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#ffffff04]">
          <Layers size={11} className="text-[#3a4a5a]" />
          <span className="text-xs text-[#3a4a5a] font-semibold">
            {t("sessionsCount", { count: room._count.sessions })}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onEdit(room)}
          className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#2e3a4a] transition-all duration-200"
          title={t("editTitle")}
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(room)}
          className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-red-400 hover:border-red-900/50 transition-all duration-200"
          title={t("deleteTitle")}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───

export default function AdminRoomsPage() {
  const t = useTranslations("AdminRoomsPage");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      setError(t("loadError"));
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
    setEditingRoom(null);
    setModalOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleSaved = (saved: Room) => {
    setRooms((prev) => {
      const exists = prev.find((r) => r.id === saved.id);
      if (exists) return prev.map((r) => (r.id === saved.id ? { ...r, ...saved } : r));
      return [...prev, saved];
    });
  };

  const handleDeleted = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = rooms.filter((r) => {
    const q = search.trim().toLowerCase();
    return !q || r.name.toLowerCase().includes(q);
  });

  const totalSessions = rooms.reduce((sum, r) => sum + r._count.sessions, 0);

  return (
    <>
      <RoomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        editingRoom={editingRoom}
      />
      <DeleteModal
        room={deletingRoom}
        onClose={() => setDeletingRoom(null)}
        onDeleted={handleDeleted}
      />

      <main className="flex-1 px-8 py-12 max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8">
          <Link href="/" className="hover:text-[#00E5FF] transition-colors">
            {t("breadcrumbHome")}
          </Link>
          <ChevronRight size={13} />
          <span className="text-white">{t("breadcrumbRooms")}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                <Building2 size={16} className="text-[#00E5FF]" />
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
            {t("addRoom")}
          </button>
        </div>

        {/* Mini stats + search */}
        {!loading && rooms.length > 0 && (
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <Building2 size={11} className="text-[#3a4a5a]" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {t("roomCount", { count: rooms.length })}
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

        {/* Table */}
        <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-[#1e2530] bg-[#060a0f]">
            <div className="w-10 shrink-0" />
            <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-[#2a3a4a]">
              {t("tableRoom")}
            </span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-[#2a3a4a]">
              {t("tableSessions")}
            </span>
            <span className="w-20 shrink-0" />
          </div>

          {/* Loading */}
          {loading &&
            Array.from({ length: 4 }).map((_, i) => <RoomRowSkeleton key={i} />)}

          {/* Error */}
          {error && (
            <div className="px-6 py-10 flex items-center justify-center gap-2 text-red-400 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && rooms.length === 0 && (
            <div className="py-20 text-center">
              <Building2 size={28} className="mx-auto text-[#1e2530] mb-3" />
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
          {!loading && !error && rooms.length > 0 && filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#3a4a5a] italic text-sm">
                {t("noSearchResults", { query: search })}
              </p>
            </div>
          )}

          {/* Rows */}
          <AnimatePresence initial={false}>
            {filtered.map((room) => (
              <RoomRow
                key={room.id}
                room={room}
                onEdit={openEdit}
                onDelete={(r) => setDeletingRoom(r)}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}