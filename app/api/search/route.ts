import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/search?q=terme&type=events|sessions|speakers
 *
 * ENDPOINT SUGGÉRÉ — recherche globale sur la plateforme.
 * Permet aux participants de trouver rapidement une session ou un intervenant.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const type = searchParams.get("type"); // "events" | "sessions" | "speakers" | null (tous)

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: "La recherche doit contenir au moins 2 caractères" },
        { status: 400 }
      );
    }

    const searchFilter = { contains: q, mode: "insensitive" as const };

    const [events, sessions, speakers] = await prisma.$transaction([
      // Recherche événements
      !type || type === "events"
        ? prisma.event.findMany({
            where: {
              OR: [{ title: searchFilter }, { description: searchFilter }, { location: searchFilter }],
            },
            take: 10,
            select: {
              id: true,
              title: true,
              slug: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          })
        : prisma.event.findMany({ where: { id: "never" }, take: 0 }),

      // Recherche sessions
      !type || type === "sessions"
        ? prisma.eventSession.findMany({
            where: {
              OR: [{ title: searchFilter }, { description: searchFilter }],
            },
            take: 10,
            include: {
              event: { select: { title: true, slug: true } },
              room: { select: { name: true } },
            },
          })
        : prisma.eventSession.findMany({ where: { id: "never" }, take: 0 }),

      // Recherche intervenants
      !type || type === "speakers"
        ? prisma.speaker.findMany({
            where: {
              OR: [{ fullName: searchFilter }, { bio: searchFilter }],
            },
            take: 10,
            select: {
              id: true,
              fullName: true,
              photo: true,
              bio: true,
            },
          })
        : prisma.speaker.findMany({ where: { id: "never" }, take: 0 }),
    ]);

    return NextResponse.json({ events, sessions, speakers, query: q });
  } catch (error) {
    console.error("[GET /api/search]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
