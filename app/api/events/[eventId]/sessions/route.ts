import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, isSessionLive } from "@/lib/auth-utils";
import { slugify } from "@/lib/slugify";
import type { SessionPayload } from "@/types";

type Params = { params: Promise<{ eventId: string }> };

// Fonction pour générer un slug unique
async function generateUniqueEventSessionSlug(title: string): Promise<string> {
  let slug = slugify(title);
  let counter = 1;
  
  while (true) {
    const existing = await prisma.eventSession.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${slugify(title)}-${counter}`;
    counter++;
  }
  
  return slug;
}

// ── GET /api/events/[eventId]/sessions
// Public — liste toutes les sessions d'un événement
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const roomSlug = searchParams.get("room");
    const roomId = searchParams.get("roomId");

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    let resolvedRoomId: string | undefined;
    if (roomSlug) {
      const room = await prisma.room.findUnique({ where: { slug: roomSlug } });
      if (!room) {
        return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
      }
      resolvedRoomId = room.id;
    } else if (roomId) {
      resolvedRoomId = roomId;
    }

    const sessions = await prisma.eventSession.findMany({
      where: {
        eventId,
        ...(resolvedRoomId && { roomId: resolvedRoomId }),
      },
      include: {
        room: true,
        speakers: {
          include: { speaker: true },
        },
        _count: { select: { questions: true } },
      },
      orderBy: { startTime: "asc" },
    });

    const enriched = sessions.map((s) => ({
      ...s,
      isLive: isSessionLive(s.startTime, s.endTime),
      speakers: s.speakers.map((ss) => ss.speaker),
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[GET /api/events/[eventId]/sessions]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── POST /api/events/[eventId]/sessions
// Admin — crée une session dans un événement
export async function POST(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { eventId } = await params;
    const body: SessionPayload = await request.json();
    const { title, description, startTime, endTime, capacity, roomId, speakerIds } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Champs obligatoires : title, startTime, endTime" },
        { status: 400 }
      );
    }

    if (!speakerIds || speakerIds.length === 0) {
      return NextResponse.json(
        { error: "Une session doit avoir au moins un intervenant" },
        { status: 400 }
      );
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json(
        { error: "startTime doit être antérieure à endTime" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    // Vérification que tous les speakerIds existent
    const speakers = await prisma.speaker.findMany({
      where: { id: { in: speakerIds } },
    });
    if (speakers.length !== speakerIds.length) {
      return NextResponse.json(
        { error: "Un ou plusieurs intervenants sont introuvables" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueEventSessionSlug(title);

    const session = await prisma.eventSession.create({
      data: {
        title,
        slug,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity,
        eventId,
        ...(roomId && { roomId }),
        speakers: {
          create: speakerIds.map((speakerId) => ({ speakerId })),
        },
      },
      include: {
        room: true,
        speakers: { include: { speaker: true } },
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json(
      {
        ...session,
        isLive: isSessionLive(session.startTime, session.endTime),
        speakers: session.speakers.map((ss) => ss.speaker),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/events/[eventId]/sessions]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
