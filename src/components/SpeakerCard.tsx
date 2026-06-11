"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2, Mic } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SpeakerLinks } from "@/types";

interface Speaker {
  id: string;
  slug?: string;
  fullName: string;
  photo?: string | null;
  bio?: string | null;
  links?: SpeakerLinks | null;
  _count: { sessions: number };
}

interface SpeakerCardProps {
  speaker: Speaker;
  onEdit: (s: Speaker) => void;
  onDelete: (s: Speaker) => void;
}

export function SpeakerCard({
  speaker,
  onEdit,
  onDelete,
}: SpeakerCardProps) {
  const t = useTranslations("AdminSpeakersPage.speakerCard");
  const initials = speaker.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const slug = speaker.slug ?? speaker.id;

  return (
    <div className="relative mt-27">
      {/* Avatar */}
      <div className="absolute z-10 -top-20 left-1/2 -translate-x-1/2">
        <div className="w-40 h-40 rounded-full bg-surface-card-alt border-2 border-[#1e2530] group-hover:border-[#00E5FF40] transition-colors duration-300 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={speaker.photo ?? `https://api.dicebear.com/7.x/adventurer/svg?seed=${speaker.fullName}&flip=true&radius=50`}
              alt={speaker.fullName}
              className="w-full h-full object-cover"
            />
        </div>
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex flex-col rounded-2xl border border-[#1e2530] bg-surface-secondary overflow-hidden hover:border-[#00E5FF30] transition-all duration-300"
        style={{
          boxShadow: "0 0 0 0 transparent",
        }}
        whileHover={{
          boxShadow: "0 0 24px #00E5FF10, 0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Top neon line on hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF60] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Clickable area */}
        <Link
          href={`/speakers/${slug}`}
          className="flex flex-col items-center pt-24 pb-5 px-5 flex-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF44] rounded-t-2xl"
        >
          {/* Name */}
          <h3 className="text-xl font-black text-content-default text-center leading-tight mb-1 group-hover:text-content-default transition-colors duration-200">
            {speaker.fullName}
          </h3>

          {/* Sessions label */}
          <div className="flex items-center gap-1 mb-3">
            <Mic size={10} className="text-content-muted" />
            <span className="text-sm text-content-muted">
              {t("sessionsCount", { count: speaker._count.sessions })}
            </span>
          </div>

          {/* Bio */}
          {speaker.bio ? (
            <p className="text-sm text-content-secondary text-center leading-relaxed line-clamp-1">
              {speaker.bio}
            </p>
          ) : (
            <p className="text-sm text-content-placeholder italic text-center">
              {t("noBio")}
            </p>
          )}
        </Link>

        {/* Action bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[#1e2530] bg-surface-input">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(speaker);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#1e2530] text-xs text-content-muted hover:text-content-default hover:border-[#2e3a4a] hover:bg-overlay-hover transition-all duration-200 font-semibold"
          >
            <Pencil size={11} />
            {t("edit")}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(speaker);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#1e2530] text-xs text-content-muted hover:text-red-400 hover:border-red-900/50 hover:bg-red-500/5 transition-all duration-200 font-semibold"
          >
            <Trash2 size={11} />
            {t("delete")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}