"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Home,
    Heart,
    LayoutDashboard,
    Calendar,
    Users,
    Building2,
    LogOut,
} from "lucide-react";

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
    const [expanded, setExpanded] = useState(false);

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-[#080a0c] border-r border-[#1a1a1a] flex flex-col py-4 z-50 transition-all duration-300 ${expanded ? "w-[220px] px-4" : "w-[60px] items-center"
                }`}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className={`w-9 h-9 rounded-xl bg-[#00E5FF] flex items-center justify-center font-black text-black text-lg cursor-pointer hover:bg-[#00ffff] transition-all hover:scale-110 shadow-lg shadow-[#00E5FF33] mb-8 flex-shrink-0 ${expanded ? "ml-0" : ""
                    }`}
            >
                {expanded ? "×" : "E"}
            </button>

            {/* Nav */}
            <nav className="flex flex-col gap-1 w-full flex-1">
                {NAV.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-all duration-200 ${active
                                    ? "bg-[#00E5FF22] text-[#00E5FF]"
                                    : "text-[#555] hover:text-[#00E5FF] hover:bg-[#00E5FF11]"
                                }`}
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            {expanded && (
                                <span className="text-sm font-semibold whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <button
                className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[#555] hover:text-[#00E5FF] hover:bg-[#00E5FF11] transition-all w-full"
            >
                <LogOut size={20} className="flex-shrink-0" />
                {expanded && (
                    <span className="text-sm font-semibold">Logout</span>
                )}
            </button>
        </aside>
    );
}