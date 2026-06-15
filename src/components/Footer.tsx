"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-[#1e2530] bg-surface-secondary px-8 py-6 mt-auto">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <span className="font-black text-sm">
          Event<span className="text-[var(--color-primary)]">Sync</span>
        </span>

        <p className="text-content-muted text-xs">
          {t("copyright")}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-content-muted text-xs hover:text-[var(--color-primary)] cursor-pointer transition-colors">
            {t("terms")}
          </span>
          <span className="text-content-muted text-xs hover:text-[var(--color-primary)] cursor-pointer transition-colors">
            {t("privacy")}
          </span>
        </div>
      </div>
    </footer>
  );
}
