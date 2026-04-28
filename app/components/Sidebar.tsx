"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#080a0c] border-r border-[#1a1a1a] flex flex-col items-center py-4 z-50 transition-all duration-300 ${
        expanded ? "w-[220px] items-start px-4" : "w-[60px] items-center"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-9 h-9 rounded-xl bg-[#00E5FF] flex items-center justify-center font-black text-black text-lg cursor-pointer hover:bg-[#00ffff] transition-all hover:scale-110 shadow-lg shadow-[#00E5FF33] mb-8 flex-shrink-0"
      >
        {expanded ? "×" : "E"}
      </button>

      <nav className="flex flex-col gap-1 w-full">
        {[
          { href: "/", icon: "🏠", label: "Home" },
          { href: "/favorites", icon: "🤍", label: "Favorites" },
          { href: "/admin", icon: "⊞", label: "Dashboard" },
          { href: "/admin/events", icon: "🗓", label: "Events" },
          { href: "/admin/speakers", icon: "👥", label: "Speakers" },
          { href: "/admin/rooms", icon: "🏛", label: "Rooms" },
        ].map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-lg transition-all duration-200 ${
                active
                  ? "bg-[#00E5FF22] text-[#00E5FF]"
                  : "text-[#555] hover:text-[#00E5FF] hover:bg-[#00E5FF11]"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {expanded && (
                <span className="text-sm font-semibold whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        className={`mt-auto flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[#555] hover:text-[#00E5FF] hover:bg-[#00E5FF11] transition-all w-full`}
      >
        <span className="text-lg flex-shrink-0">↪</span>
        {expanded && (
          <span className="text-sm font-semibold">Logout</span>
        )}
      </button>
    </aside>
  );
}