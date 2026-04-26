/**
 * Génère un slug URL-friendly depuis un titre.
 * Ex: "Mon Super Événement 2026" → "mon-super-evenement-2026"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Génère un slug unique en ajoutant un suffixe aléatoire si nécessaire
export function uniqueSlug(base: string, suffix?: string): string {
  const slug = slugify(base);
  if (suffix) return `${slug}-${suffix}`;
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
}
