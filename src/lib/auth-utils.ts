import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getAdminSession() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Accès refusé — réservé aux administrateurs" },
      { status: 403 }
    );
  }

  return null;
}

export function isSessionLive(startTime: Date, endTime: Date): boolean {
  const now = new Date();
  return now >= startTime && now <= endTime;
}