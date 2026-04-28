"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[60px] bg-[#080a0c] border-r border-[#1a1a1a] flex flex-col items-center py-4 z-50">
    </aside>
  );
}