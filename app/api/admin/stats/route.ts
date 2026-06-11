import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const now = new Date();

    const [
      totalEvents,
      totalSessions,
      totalSpeakers,
      totalRooms,
      totalQuestions,
      liveSessionsCount,
      upcomingEventsCount,
      recentQuestions,
      recentEventsRaw,
    ] = await prisma.$transaction([
      prisma.event.count(),
      prisma.eventSession.count(),
      prisma.speaker.count(),
      prisma.room.count(),
      prisma.question.count(),

      // Sessions actuellement en cours
      prisma.eventSession.count({
        where: {
          startTime: { lte: now },
          endTime: { gte: now },
        },
      }),

      // Événements à venir (startDate > maintenant)
      prisma.event.count({
        where: { startDate: { gt: now } },
      }),

      // 5 dernières questions posées
      prisma.question.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          session: {
            select: {
              title: true,
              event: { select: { title: true, slug: true } },
            },
          },
        },
      }),
      prisma.event.findMany({
        take: 5,
        orderBy: { startDate: "desc" },
        include: {
          _count: { select: { sessions: true } },
        },
      }),
    ]);

    const recentEvents = recentEventsRaw.map((event) => ({
      ...event,
      location: event.location ?? undefined,
    }));

    return NextResponse.json({
      totals: {
        events: totalEvents,
        sessions: totalSessions,
        speakers: totalSpeakers,
        rooms: totalRooms,
        questions: totalQuestions,
      },
      live: {
        activeSessions: liveSessionsCount,
      },
      upcoming: {
        events: upcomingEventsCount,
      },
      recentQuestions,
      recentEvents,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
