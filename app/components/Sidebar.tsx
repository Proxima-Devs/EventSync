"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[60px] bg-[#080a0c] border-r border-[#1a1a1a] flex flex-col items-center py-4 z-50">
      <div className="w-9 h-9 rounded-xl bg-[#00E5FF] flex items-center justify-center font-black text-black text-lg cursor-pointer hover:bg-[#00ffff] transition-all hover:scale-110 shadow-lg shadow-[#00E5FF33] mb-8">
        E
      </div>
    </aside>
  );
}