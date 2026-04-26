import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isSessionLive } from "@/lib/auth-utils";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/events/slug/[slug]
 * 
 * ENDPOINT SUGGÉRÉ — nécessaire pour les pages publiques frontend
 * qui utilisent le slug dans l'URL (ex: /events/my-conference-2026).
 * Retourne le même format que GET /api/events/[eventId].
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        sessions: {
          include: {
            room: true,
            speakers: {
              include: { speaker: true },
            },
            _count: { select: { questions: true } },
          },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    const enriched = {
      ...event,
      sessions: event.sessions.map((s) => ({
        ...s,
        isLive: isSessionLive(s.startTime, s.endTime),
        speakers: s.speakers.map((ss) => ss.speaker),
      })),
    };

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[GET /api/events/slug/[slug]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
