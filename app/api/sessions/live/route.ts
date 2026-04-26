import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/sessions/live
 *
 * ENDPOINT SUGGÉRÉ — retourne toutes les sessions actuellement en cours.
 * Utile pour une page d'accueil "En ce moment" ou un widget temps réel.
 */
export async function GET() {
  try {
    const now = new Date();

    const liveSessions = await prisma.eventSession.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        event: { select: { id: true, title: true, slug: true } },
        room: true,
        speakers: {
          include: { speaker: { select: { id: true, fullName: true, photo: true } } },
        },
        _count: { select: { questions: true } },
      },
      orderBy: { startTime: "asc" },
    });

    const enriched = liveSessions.map((s) => ({
      ...s,
      isLive: true,
      speakers: s.speakers.map((ss) => ss.speaker),
    }));

    return NextResponse.json({
      count: enriched.length,
      sessions: enriched,
    });
  } catch (error) {
    console.error("[GET /api/sessions/live]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
