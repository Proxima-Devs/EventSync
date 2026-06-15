const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Erreur ${res.status}`);
  }

  return res.json() as Promise<T>;
}