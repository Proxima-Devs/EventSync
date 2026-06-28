import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, isSessionLive } from "@/lib/auth-utils";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { Prisma } from "@/generated/prisma/client";
import type { SessionPayload } from "@/types";

function parsePagination(searchParams: URLSearchParams) {
  const start = parseInt(searchParams.get("_start") ?? searchParams.get("start") ?? "0", 10);
  const end = parseInt(searchParams.get("_end") ?? searchParams.get("end") ?? `${start + 20}`, 10);
  const perPage = end - start > 0 ? end - start : 20;
  return { start: Number.isNaN(start) ? 0 : start, take: perPage };
}

const SESSION_SORT_FIELDS = ["id", "title", "startTime", "endTime", "createdAt", "updatedAt"];

function parseSort(searchParams: URLSearchParams) {
  const field = searchParams.get("_sort") ?? "startTime";
  const order = (searchParams.get("_order") ?? "ASC").toLowerCase() === "desc" ? "desc" : "asc";
  return { field: SESSION_SORT_FIELDS.includes(field) ? field : "startTime", order };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { start, take } = parsePagination(searchParams);
    const { field, order } = parseSort(searchParams);
    const eventId = searchParams.get("eventId");
    const roomId = searchParams.get("roomId");
    const speakerId = searchParams.get("speakerId");
    const q = searchParams.get("q");

    const where = {
      ...(eventId ? { eventId } : undefined),
      ...(roomId ? { roomId } : undefined),
      ...(speakerId ? { speakers: { some: { speakerId } } } : undefined),
      ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : undefined),
    };

    const sessions = await prisma.eventSession.findMany({
      where,
      skip: start,
      take,
      orderBy: { [field]: order },
      include: {
        event: { select: { id: true, title: true, slug: true } },
        room: true,
        speakers: { include: { speaker: true } },
        _count: { select: { questions: true } },
      },
    });

    const total = await prisma.eventSession.count({ where });
    const data = sessions.map((session) => ({
      ...session,
      isLive: isSessionLive(session.startTime, session.endTime),
      speakers: session.speakers.map((ss) => ss.speaker),
    }));

    return NextResponse.json({ data, meta: { total } });
  } catch (error) {
    console.error("[GET /api/sessions]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  let body: SessionPayload & { eventId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { title, description, startTime, endTime, capacity, roomId, speakerIds, eventId } = body;

  if (!eventId) {
    return NextResponse.json({ error: "eventId est requis" }, { status: 400 });
  }
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

  const speakers = await prisma.speaker.findMany({ where: { id: { in: speakerIds } } });
  if (speakers.length !== speakerIds.length) {
    return NextResponse.json(
      { error: "Un ou plusieurs intervenants sont introuvables" },
      { status: 400 }
    );
  }

  try {
    const slug = slugify(title);
    const session = await prisma.eventSession.create({
      data: {
        title,
        slug,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity,
        eventId,
        ...(roomId ? { roomId } : {}),
        speakers: {
          create: speakerIds.map((speakerId) => ({ speakerId })),
        },
      },
      include: {
        event: { select: { id: true, title: true, slug: true } },
        room: true,
        speakers: { include: { speaker: true } },
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json(
      {
        ...session,
        isLive: false,
        speakers: session.speakers.map((ss) => ss.speaker),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const session = await prisma.eventSession.create({
        data: {
          title,
          slug: uniqueSlug(slugify(title)),
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          capacity,
          eventId,
          ...(roomId ? { roomId } : {}),
          speakers: { create: speakerIds.map((speakerId) => ({ speakerId })) },
        },
        include: {
          event: { select: { id: true, title: true, slug: true } },
          room: true,
          speakers: { include: { speaker: true } },
          _count: { select: { questions: true } },
        },
      }).catch(() => null);
      if (session) {
        return NextResponse.json(
          { ...session, isLive: false, speakers: session.speakers.map((ss) => ss.speaker) },
          { status: 201 }
        );
      }
    }
    console.error("[POST /api/sessions]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
