"use client";

import { useTheme } from '@/hooks/useTheme';
import { Home, Heart, LayoutDashboard, Calendar, Users, Building2, LogOut, PanelLeft, Settings, LogIn, Trash2, X, AlertTriangle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSidebar } from "./sidebar-context";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import type { ThemeMode } from "@/types/theme";

type NavItem = { href: string; icon: React.ElementType; label: string };

function getNavItems(role?: string | null, t?: (key: string) => string): NavItem[] {
    if (role === "ADMIN") {
        return [
            { href: "/admin/dashboard", icon: LayoutDashboard, label: t?.("nav.dashboard") ?? "Dashboard" },
            { href: "/", icon: Home, label: t?.("nav.home") ?? "Home" },
            { href: "/favorites", icon: Heart, label: t?.("nav.favorites") ?? "Favorites" },
            { href: "/admin/events", icon: Calendar, label: t?.("nav.events") ?? "Events" },
            { href: "/admin/speakers", icon: Users, label: t?.("nav.speakers") ?? "Speakers" },
            { href: "/admin/rooms", icon: Building2, label: t?.("nav.rooms") ?? "Rooms" },
        ];
    }
    return [
        { href: "/", icon: Calendar, label: t?.("nav.events") ?? "Events" },
        { href: "/favorites", icon: Heart, label: t?.("nav.favorites") ?? "Favorites" },
        { href: "/speakers", icon: Users, label: t?.("nav.speakers") ?? "Speakers" },
    ];

}

function DeleteConfirmDialog({
    onConfirm,
    onCancel,
    loading,
    t,
}: {
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
    t: (key: string) => string;
}) {
    return (
        <div className="fixed inset-0 z-300 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-100 max-w-[90vw] bg-[#0e1114] border border-[#1e2226] rounded-2xl p-6 shadow-2xl shadow-black/60 animate-scale-in">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                        <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <h3 className="text-base font-bold text-[#eee]">{t("deleteAccount")}</h3>
                </div>

                <p className="text-sm text-[#777] leading-relaxed mb-6">
                    {t("deleteConfirmationIntro")} <span className="text-[#aaa] font-semibold">{t("deleteConfirmationIrreversible")}</span>. {t("deleteConfirmationOutro")}
                </p>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold text-[#777] hover:text-[#aaa] hover:bg-white/4 transition-colors disabled:opacity-50"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                                {t("deleting")}
                            </>
                        ) : (
                            <>
                                <Trash2 size={14} />
                                {t("deletePermanently")}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SettingsModal({
    user,
    onClose,
}: {
    user: { name?: string | null; email?: string | null; image?: string | null };
    onClose: () => void;
}) {
    const router = useRouter();
    const locale = useLocale() as "fr" | "en";
    const t = useTranslations("Sidebar");
    const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
    const [tab, setTab] = useState<"profile" | "general" | "appearance">("profile");
    const [lang, setLang] = useState<"fr" | "en">(locale);
    const overlayRef = useRef<HTMLDivElement>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        setLang(locale);
    }, [locale]);

    const handleLanguageChange = (newLocale: "fr" | "en") => {
        setLang(newLocale);
        document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
        router.refresh();
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === "Escape" && !showDeleteConfirm && onClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose, showDeleteConfirm]);

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        setDeleteError(null);
        try {
            await authClient.deleteUser();
            router.push("/");
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : t("genericError"));
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <div
                ref={overlayRef}
                onClick={(e) => e.target === overlayRef.current && onClose()}
                className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
                <div className="relative flex w-160 max-w-[90vw] h-110 bg-[#0e1114] border border-[#1e2226] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 animate-scale-in">

                    <button
                        onClick={onClose}
                        className="cursor-pointer absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-lg text-[#444] hover:text-[#aaa] hover:bg-white/5 transition-colors"
                    >
                        <X size={15} />
                    </button>

                    <div className="w-44 shrink-0 bg-[#080a0c] border-r border-[#1a1a1a] flex flex-col px-2 py-5 gap-1">
                        <p className="px-3 pb-2 text-[10px] font-bold tracking-widest uppercase text-[#444]">
                            {t("account")}
                        </p>
                        {(["profile", "general", "appearance"] as const).map((tabKey) => (
                            <button
                                key={tabKey}
                                onClick={() => setTab(tabKey)}
                                className={`cursor-pointer w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150
                                    ${tab === tabKey
                                        ? "bg-primary-light text-primary"
                                        : "text-[#666] hover:text-[#aaa] hover:bg-white/4"
                                    }`}
                            >
                                {tabKey === "profile" ? t("profileTitle") : tabKey === "general" ? t("general") : t("appearance")}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-7">
                        {tab === "profile" && (
                            <div>
                                <h2 className="text-base font-bold text-[#eee] mb-6">{t("profileTitle")}</h2>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-1.5">
                                            {t("fullName")}
                                        </p>
                                        <div className="bg-[#111316] border border-[#1e2226] rounded-xl px-4 py-2.5 text-sm text-[#ccc]">
                                            {user.name ?? t("noValue")}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-1.5">
                                            {t("emailAddress")}
                                        </p>
                                        <div className="bg-[#111316] border border-[#1e2226] rounded-xl px-4 py-2.5 text-sm text-[#ccc]">
                                            {user.email ?? t("noValue")}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-5 border-t border-[#1a1a1a]">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-[#666]">{t("deleteAccount")}</p>
                                            <p className="text-xs text-[#444] mt-0.5">
                                                {t("deleteAccountDescription")}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setDeleteError(null);
                                                setShowDeleteConfirm(true);
                                            }}
                                            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors shrink-0"
                                        >
                                            <Trash2 size={14} />
                                            {t("deleteAccount")}
                                        </button>
                                    </div>

                                    {deleteError && (
                                        <p className="mt-3 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                                            {deleteError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {tab === "general" && (
                            <div>
                                <h2 className="text-base font-bold text-[#eee] mb-6">{t("general")}</h2>

                                <div className="mb-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
                                        {t("theme")}
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(
                                            [
                                                { value: "dark", labelKey: "themeOption.dark", emoji: "🌑" },
                                                { value: "light", labelKey: "themeOption.light", emoji: "☀️" },
                                                { value: "system", labelKey: "themeOption.system", emoji: "💻" },
                                            ] as const
                                        ).map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setTheme(opt.value)}
                                                className={`cursor-pointer py-2.5 rounded-xl border text-xs font-bold transition-all
                                                    ${theme.mode === opt.value
                                                        ? "border-primary-light bg-primary-light text-primary"
                                                        : "border-[#1e2226] bg-[#111316] text-[#666] hover:text-[#aaa] hover:border-[#333]"
                                                    }`}
                                            >
                                                <span className="mr-1.5">{opt.emoji}</span>
                                                {t(opt.labelKey)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
                                        {t("language")}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(
                                            [
                                                { value: "fr", labelKey: "languageOption.fr", flag: "🇫🇷" },
                                                { value: "en", labelKey: "languageOption.en", flag: "🇬🇧" },
                                            ] as const
                                        ).map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleLanguageChange(opt.value)}
                                                className={`cursor-pointer py-2.5 rounded-xl border text-sm font-bold transition-all
                                                    ${lang === opt.value
                                                        ? "border-primary-light bg-primary-light text-primary"
                                                        : "border-[#1e2226] bg-[#111316] text-[#666] hover:text-[#aaa] hover:border-[#333]"
                                                    }`}
                                            >
                                                <span className="mr-2">{opt.flag}</span>
                                                {t(opt.labelKey)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === "appearance" && (
                            <div>
                                <h2 className="text-base font-bold text-[#eee] mb-6">{t("appearanceTitle")}</h2>
                                <p className="text-sm text-[#999] mb-6">{t("appearanceDescription")}</p>
                                <ThemeCustomizer />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDeleteConfirm && (
                <DeleteConfirmDialog
                    loading={deleteLoading}
                    onConfirm={handleDeleteAccount}
                    onCancel={() => setShowDeleteConfirm(false)}
                    t={t}
                />
            )}
        </>
    );
}

function UserPopup({
    user,
    onSettings,
    onLogout,
    onClose,
}: {
    user: { name?: string | null; email?: string | null; image?: string | null };
    onSettings: () => void;
    onLogout: () => void;
    onClose: () => void;
}) {
    const popupRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("Sidebar");

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        setTimeout(() => document.addEventListener("mousedown", handler), 0);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    return (
        <div
            ref={popupRef}
            className="absolute bottom-[calc(100%+8px)] left-0 right-0 mx-2 bg-[#111316] border border-[#1e2024] rounded-2xl overflow-hidden shadow-xl shadow-black/60 z-100 animate-fade-up"
        >
            <div className="px-4 py-3 border-b border-[#1a1a1a]">
                <p className="text-[11px] text-[#555] truncate">{user.email ?? t("noValue")}</p>
            </div>

            <div className="p-1">
                <button
                    onClick={onSettings}
                    className="cursor-pointer flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#aaa] hover:text-[#eee] hover:bg-white/4 transition-colors"
                >
                    <Settings size={15} className="shrink-0" />
                    {t("auth.settings")}
                </button>
                <button
                    onClick={onLogout}
                    className="cursor-pointer flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#aaa] hover:text-red-400 hover:bg-red-400/[0.07] transition-colors"
                >
                    <LogOut size={15} className="shrink-0" />
                    {t("auth.logout")}
                </button>
            </div>
        </div>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const { expanded, setExpanded } = useSidebar();
    const { data: session } = authClient.useSession();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("Sidebar");

    const [popupOpen, setPopupOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const user = session?.user;
    const isLoggedIn = !!user;
    const role = (user as { role?: string } | undefined)?.role ?? null;
    const navItems = getNavItems(role, t);

    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";

    const handleLogout = async () => {
        await authClient.signOut();
        setPopupOpen(false);
        router.push("/");
    };

    return (
        <>
            <aside
                className={`
                    fixed left-0 top-0 h-screen bg-[#080a0c] border-r border-[#1a1a1a]
                    flex flex-col z-50 overflow-visible
                    transition-[width] duration-300 ease-in-out
                    ${expanded ? "w-55" : "w-15"}
                `}
            >
                <div className="flex items-center h-16 pl-4 pr-3 shrink-0">
                    <span
                        className={`
                            font-[Lavishly_Yours] text-3xl text-primary whitespace-nowrap
                            select-none
                            transition-all duration-300 ease-in-out
                            ${expanded ? "max-w-40 opacity-100 mr-auto" : "max-w-0 opacity-0 mr-0"}
                        `}
                    >
                        EventSync
                    </span>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 text-[#444] hover:text-primary hover:bg-primary-light transition-colors duration-200 cursor-pointer ml-auto"
                    >
                        <PanelLeft size={18} className={`transition-transform duration-300 ${expanded ? "" : "rotate-180"}`} />
                    </button>
                </div>

                <nav className="flex flex-col gap-0.5 flex-1 px-2 py-2 overflow-visible">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    group relative flex items-center rounded-xl px-2.5 py-2.5 transition-colors duration-200
                                    ${active ? "bg-primary-lighter text-primary" : "text-[#505050] hover:text-primary hover:bg-primary-light"}
                                `}
                            >
                                <Icon size={19} className="shrink-0" />
                                <span className={`text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-w-40 opacity-100 pl-3" : "max-w-0 opacity-0 pl-0"}`}>
                                    {item.label}
                                </span>
                                <span
                                  className={`absolute left-full ml-3 px-2.5 py-1 rounded-md z-50 text-black text-xs font-bold whitespace-nowrap pointer-events-none transition-all duration-200 ${expanded ? "opacity-0 translate-x-0 invisible" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`}
                                  style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 20px color-mix(in srgb, var(--color-primary) 13%)' }}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="relative px-2 pb-4 overflow-visible">
                    {isLoggedIn && popupOpen && (
                        <UserPopup
                            user={user}
                            onSettings={() => { setPopupOpen(false); setSettingsOpen(true); }}
                            onLogout={handleLogout}
                            onClose={() => setPopupOpen(false)}
                        />
                    )}

                    {isLoggedIn ? (
                        <button
                            onClick={() => setPopupOpen((v) => !v)}
                            className="group relative flex items-center w-full rounded-xl px-2.5 py-2 gap-2.5 text-[#888] hover:text-[#ccc] hover:bg-white/4 transition-colors duration-200 cursor-pointer"
                        >
                            {user.image ? (
                                <Image src={user.image} alt={user.name} width={32} height={32} className="rounded-full object-cover shrink-0 ring-1 ring-white/10" />
                            ) : (
                                <div
                                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-black text-xs font-bold ring-1 ring-white/10"
                                  style={{ backgroundImage: 'linear-gradient(to bottom right, var(--color-primary), #0066ff)' }}
                                >
                                    {initials}
                                </div>
                            )}
                            <span className={`text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300 ease-in-out ${expanded ? "max-w-32 opacity-100" : "max-w-0 opacity-0"}`}>
                                {user.name ?? user.email}
                            </span>
                            <span
                              className={`absolute left-full ml-3 px-2.5 py-1 rounded-md z-50 text-black text-xs font-bold whitespace-nowrap pointer-events-none transition-all duration-200 ${expanded ? "opacity-0 invisible" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`}
                              style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 20px color-mix(in srgb, var(--color-primary) 13%)' }}
                            >
                                {user.name ?? t("auth.profile")}
                            </span>
                        </button>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="group relative flex items-center rounded-xl px-2.5 py-2.5 w-full text-[#505050] hover:text-primary hover:bg-primary-light transition-colors duration-200"
                        >
                            <LogIn size={19} className="shrink-0" />
                            <span className={`text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-w-40 opacity-100 pl-3" : "max-w-0 opacity-0 pl-0"}`}>
                                {t("auth.login")}
                            </span>
                            <span className={`absolute left-full ml-3 px-2.5 py-1 rounded-md z-50 bg-[#00E5FF] text-black text-xs font-bold whitespace-nowrap pointer-events-none shadow-lg shadow-[#00E5FF22] transition-all duration-200 ${expanded ? "opacity-0 invisible" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`}>
                                {t("auth.login")}
                            </span>
                        </Link>
                    )}
                </div>
            </aside>

            {settingsOpen && user && (
                <SettingsModal user={user} onClose={() => setSettingsOpen(false)} />
            )}
        </>
    );
}