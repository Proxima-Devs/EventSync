"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Heart, LayoutDashboard, Calendar,
    Users, Building2, LogOut, PanelLeft,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";

const NAV = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/favorites", icon: Heart, label: "Favorites" },
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/events", icon: Calendar, label: "Events" },
    { href: "/admin/speakers", icon: Users, label: "Speakers" },
    { href: "/admin/rooms", icon: Building2, label: "Rooms" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { expanded, setExpanded } = useSidebar();

    return (
        <aside className={`
            fixed left-0 top-0 h-screen bg-[#080a0c] border-r border-[#1a1a1a]
            flex flex-col z-50 overflow-visible
            transition-[width] duration-300 ease-in-out
            ${expanded ? "w-55" : "w-15"}
        `}>

            {/* ── Header ── */}
            <div className="flex items-center h-16 px-3 shrink-0">
                {/* Logo */}
                <span className={`
                    font-[Lavishly_Yours] text-3xl text-[#00E5FF] whitespace-nowrap
                    overflow-hidden select-none
                    transition-all duration-300 ease-in-out
                    ${expanded ? "max-w-40 opacity-100 mr-auto" : "max-w-0 opacity-0 mr-0"}
                `}>
                    EventSync
                </span>

                {/* Bouton toggle — toujours à droite */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="
                        w-8 h-8 flex items-center justify-center rounded-lg shrink-0
                        text-[#444] hover:text-[#00E5FF] hover:bg-[#00E5FF11]
                        transition-colors duration-200 cursor-pointer ml-auto
                    "
                >
                    <PanelLeft
                        size={18}
                        className={`transition-transform duration-300 ${expanded ? "" : "rotate-180"}`}
                    />
                </button>
            </div>

            {/* ── Nav ── */}
            <nav className="flex flex-col gap-0.5 flex-1 px-2 py-2 overflow-visible">
                {NAV.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                group relative flex items-center rounded-xl
                                px-2.5 py-2.5 transition-colors duration-200
                                ${active
                                    ? "bg-[#00E5FF18] text-[#00E5FF]"
                                    : "text-[#505050] hover:text-[#00E5FF] hover:bg-[#00E5FF0d]"
                                }
                            `}
                        >
                            <Icon size={19} className="shrink-0" />

                            <span className={`
                                text-sm font-semibold whitespace-nowrap overflow-hidden
                                transition-all duration-300 ease-in-out
                                ${expanded ? "max-w-40 opacity-100 pl-3" : "max-w-0 opacity-0 pl-0"}
                            `}>
                                {item.label}
                            </span>

                            <span className={`
                                absolute left-full ml-3 px-2.5 py-1 rounded-md z-50
                                bg-[#00E5FF] text-black text-xs font-bold whitespace-nowrap
                                pointer-events-none shadow-lg shadow-[#00E5FF22]
                                transition-all duration-200
                                ${expanded
                                    ? "opacity-0 translate-x-0 invisible"
                                    : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                                }
                            `}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* ── Logout ── */}
            <div className="px-2 pb-4 overflow-visible">
                <button className="
                    group relative flex items-center rounded-xl
                    px-2.5 py-2.5 w-full cursor-pointer
                    text-[#505050] hover:text-[#00E5FF] hover:bg-[#00E5FF0d]
                    transition-colors duration-200
                ">
                    <LogOut size={19} className="shrink-0" />

                    <span className={`
                        text-sm font-semibold whitespace-nowrap overflow-hidden
                        transition-all duration-300 ease-in-out
                        ${expanded ? "max-w-40 opacity-100 pl-3" : "max-w-0 opacity-0 pl-0"}
                    `}>
                        Logout
                    </span>

                    <span className={`
                        absolute left-full ml-3 px-2.5 py-1 rounded-md z-50
                        bg-[#00E5FF] text-black text-xs font-bold whitespace-nowrap
                        pointer-events-none shadow-lg shadow-[#00E5FF22]
                        transition-all duration-200
                        ${expanded
                            ? "opacity-0 invisible"
                            : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                        }
                    `}>
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}