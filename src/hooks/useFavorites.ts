"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "eventsync_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggle = useCallback((sessionId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (sessionId: string) => favorites.includes(sessionId),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}