"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarCtx {
    expanded: boolean;
    setExpanded: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarCtx>({
    expanded: true,
    setExpanded: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [expanded, setExpanded] = useState(true);
    return (
        <SidebarContext.Provider value={{ expanded, setExpanded }}>
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => useContext(SidebarContext);