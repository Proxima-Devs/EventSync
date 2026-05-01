"use client";

import { useSidebar } from "./sidebar-context";
import { ReactNode } from "react";

export default function SidebarAwareMain({ children }: { children: ReactNode }) {
    const { expanded } = useSidebar();
    return (
        <main className={`
            transition-[margin-left] duration-300 ease-in-out min-h-screen
            ${expanded ? "ml-55" : "ml-15"}
        `}>
            {children}
        </main>
    );
}