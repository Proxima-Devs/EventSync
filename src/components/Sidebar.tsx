"use client";

import { Home, Heart, LayoutDashboard, Calendar, Users, Building2, LogOut, PanelLeft, Settings, LogIn, Trash2, X, AlertTriangle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSidebar } from "./sidebar-context";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { ThemeCustomizer } from "./settings/ThemeCustomizer";

type NavItem = { href: string; icon: React.ElementType; label: string };

function getNavItems(role?: string | null): NavItem[] {
    if (role === "ADMIN") {
        return [
            { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/", icon: Home, label: "Home" },
            { href: "/favorites", icon: Heart, label: "Favorites" },
            { href: "/admin/events", icon: Calendar, label: "Events" },
            { href: "/admin/speakers", icon: Users, label: "Speakers" },
            { href: "/admin/rooms", icon: Building2, label: "Rooms" },
        ];
    }
    return [
        { href: "/", icon: Calendar, label: "Events" },
        { href: "/favorites", icon: Heart, label: "Favorites" },
        { href: "/speakers", icon: Users, label: "Speakers" },
    ];

}

function DeleteConfirmDialog({
    onConfirm,
    onCancel,
    loading,
}: {
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div className="fixed inset-0 z-300 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-100 max-w-[90vw] bg-[#0e1114] border border-[#1e2226] rounded-2xl p-6 shadow-2xl shadow-black/60 animate-scale-in">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                        <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <h3 className="text-base font-bold text-[#eee]">Supprimer le compte</h3>
                </div>

                <p className="text-sm text-[#777] leading-relaxed mb-6">
                    Cette action est <span className="text-[#aaa] font-semibold">irréversible</span>.
                    Toutes vos données seront définitivement supprimées et vous ne pourrez pas
                    récupérer votre compte.
                </p>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold text-[#777] hover:text-[#aaa] hover:bg-white/4 transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                                Suppression…
                            </>
                        ) : (
                            <>
                                <Trash2 size={14} />
                                Supprimer définitivement
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
    const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
    const [tab, setTab] = useState<"profile" | "general" | "appearance">("profile");
    const [lang, setLang] = useState<"fr" | "en">("fr");
    const overlayRef = useRef<HTMLDivElement>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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
            setDeleteError(err instanceof Error ? err.message : "Une erreur est survenue.");
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
                            Compte
                        </p>
                        {(["profile", "general", "appearance"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`cursor-pointer w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150
                                    ${tab === t
                                        ? "bg-[#00E5FF14] text-[#00E5FF]"
                                        : "text-[#666] hover:text-[#aaa] hover:bg-white/4"
                                    }`}
                            >
                                {t === "profile" ? "Profil" : t === "general" ? "Général" : "Apparence"}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-7">
                        {tab === "profile" && (
                            <div>
                                <h2 className="text-base font-bold text-[#eee] mb-6">Profil</h2>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-1.5">
                                            Nom complet
                                        </p>
                                        <div className="bg-[#111316] border border-[#1e2226] rounded-xl px-4 py-2.5 text-sm text-[#ccc]">
                                            {user.name ?? "—"}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-1.5">
                                            Adresse email
                                        </p>
                                        <div className="bg-[#111316] border border-[#1e2226] rounded-xl px-4 py-2.5 text-sm text-[#ccc]">
                                            {user.email ?? "—"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-5 border-t border-[#1a1a1a]">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-[#666]">Supprimer le compte</p>
                                            <p className="text-xs text-[#444] mt-0.5">
                                                Action irréversible — toutes les données seront perdues.
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
                                            Supprimer
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
                                <h2 className="text-base font-bold text-[#eee] mb-6">Général</h2>

                                <div className="mb-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
                                        Thème
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(
                                            [
                                                { value: "dark", label: "Sombre", emoji: "🌑" },
                                                { value: "light", label: "Clair", emoji: "☀️" },
                                                { value: "system", label: "Système", emoji: "💻" },
                                            ] as const
                                        ).map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setTheme(opt.value)}
                                                className={`cursor-pointer py-2.5 rounded-xl border text-xs font-bold transition-all
                                                    ${theme === opt.value
                                                        ? "border-[#00E5FF44] bg-[#00E5FF12] text-[#00E5FF]"
                                                        : "border-[#1e2226] bg-[#111316] text-[#666] hover:text-[#aaa] hover:border-[#333]"
                                                    }`}
                                            >
                                                <span className="mr-1.5">{opt.emoji}</span>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-3">
                                        Langue
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(
                                            [
                                                { value: "fr", label: "Français", flag: "🇫🇷" },
                                                { value: "en", label: "English", flag: "🇬🇧" },
                                            ] as const
                                        ).map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setLang(opt.value)}
                                                className={`cursor-pointer py-2.5 rounded-xl border text-sm font-bold transition-all
                                                    ${lang === opt.value
                                                        ? "border-[#00E5FF44] bg-[#00E5FF12] text-[#00E5FF]"
                                                        : "border-[#1e2226] bg-[#111316] text-[#666] hover:text-[#aaa] hover:border-[#333]"
                                                    }`}
                                            >
                                                <span className="mr-2">{opt.flag}</span>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === "appearance" && (
                            <div>
                                <h2 className="text-base font-bold text-[#eee] mb-6">Personnaliser l'apparence</h2>
                                <p className="text-sm text-[#999] mb-6">Choisissez vos propres couleurs pour personnaliser votre interface.</p>
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
                <p className="text-[11px] text-[#555] truncate">{user.email ?? "—"}</p>
            </div>

            <div className="p-1">
                <button
                    onClick={onSettings}
                    className="cursor-pointer flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#aaa] hover:text-[#eee] hover:bg-white/4 transition-colors"
                >
                    <Settings size={15} className="shrink-0" />
                    Paramètres
                </button>
                <button
                    onClick={onLogout}
                    className="cursor-pointer flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#aaa] hover:text-red-400 hover:bg-red-400/[0.07] transition-colors"
                >
                    <LogOut size={15} className="shrink-0" />
                    Déconnexion
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

    const [popupOpen, setPopupOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const user = session?.user;
    const isLoggedIn = !!user;
    const role = (user as { role?: string } | undefined)?.role ?? null;
    const navItems = getNavItems(role);

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
                            font-[Lavishly_Yours] text-3xl text-[#00E5FF] whitespace-nowrap
                            select-none
                            transition-all duration-300 ease-in-out
                            ${expanded ? "max-w-40 opacity-100 mr-auto" : "max-w-0 opacity-0 mr-0"}
                        `}
                    >
                        EventSync
                    </span>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 text-[#444] hover:text-[#00E5FF] hover:bg-[#00E5FF11] transition-colors duration-200 cursor-pointer ml-auto"
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
                                    ${active ? "bg-[#00E5FF18] text-[#00E5FF]" : "text-[#505050] hover:text-[#00E5FF] hover:bg-[#00E5FF0d]"}
                                `}
                            >
                                <Icon size={19} className="shrink-0" />
                                <span className={`text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-w-40 opacity-100 pl-3" : "max-w-0 opacity-0 pl-0"}`}>
                                    {item.label}
                                </span>
                                <span className={`absolute left-full ml-3 px-2.5 py-1 rounded-md z-50 bg-[#00E5FF] text-black text-xs font-bold whitespace-nowrap pointer-events-none shadow-lg shadow-[#00E5FF22] transition-all duration-200 ${expanded ? "opacity-0 translate-x-0 invisible" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`}>
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
                                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-linear-to-br from-[#00E5FF] to-[#0066ff] text-black text-xs font-bold ring-1 ring-white/10">
                                    {initials}
                                </div>
                            )}
                            <span className={`text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300 ease-in-out ${expanded ? "max-w-32 opacity-100" : "max-w-0 opacity-0"}`}>
                                {user.name ?? user.email}
                            </span>
                            <span className={`absolute left-full ml-3 px-2.5 py-1 rounded-md z-50 bg-[#00E5FF] text-black text-xs font-bold whitespace-nowrap pointer-events-none shadow-lg shadow-[#00E5FF22] transition-all duration-200 ${expanded ? "opacity-0 invisible" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`}>
                                {user.name ?? "Profil"}
                            </span>
                        </button>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="group relative flex items-center rounded-xl px-2.5 py-2.5 w-full text-[#505050] hover:text-[#00E5FF] hover:bg-[#00E5FF0d] transition-colors duration-200"
                        >
                            <LogIn size={19} className="shrink-0" />
                            <span className={`text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-w-40 opacity-100 pl-3" : "max-w-0 opacity-0 pl-0"}`}>
                                Se connecter
                            </span>
                            <span className={`absolute left-full ml-3 px-2.5 py-1 rounded-md z-50 bg-[#00E5FF] text-black text-xs font-bold whitespace-nowrap pointer-events-none shadow-lg shadow-[#00E5FF22] transition-all duration-200 ${expanded ? "opacity-0 invisible" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`}>
                                Se connecter
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