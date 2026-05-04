import {NextRequest, NextResponse} from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      startTime,
      endTime,
      eventId,
      roomId,
      speakerIds,
    } = body;

    // ── VALIDATION MINIMALE
    if (!title || !startTime || !endTime || !eventId || !roomId) {
      return NextResponse.json(
          { error: "Champs manquants" },
          { status: 400 }
      );
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json(
          { error: "startTime doit être avant endTime" },
          { status: 400 }
      );
    }

    // ── CREATE SESSION
    const session = await prisma.eventSession.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),

        event: {
          connect: { id: eventId },
        },

        room: {
          connect: { id: roomId },
        },

        // speakers relation (many-to-many)
        speakers: speakerIds?.length
            ? {
              create: speakerIds.map((id: string) => ({
                speaker: { connect: { id } },
              })),
            }
            : undefined,
      },

      include: {
        event: true,
        room: true,
        speakers: {
          include: {
            speaker: true,
          },
        },
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("[POST /api/sessions]", error);

    return NextResponse.json(
        { error: "Erreur serveur" },
        { status: 500 }
    );
  }
}
