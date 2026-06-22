import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { isSessionLive } from "@/lib/auth-utils";
import type { EventPayload } from "@/types";

type Params = { params: Promise<{ eventId: string }> };

// ── GET /api/events/[eventId]
// Public — détail complet d'un événement (sessions + salles + intervenants)
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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

    // Enrichit chaque session avec le flag `isLive`
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
    console.error("[GET /api/events/[eventId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── PUT /api/events/[eventId]
// Admin — met à jour un événement
export async function PUT(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { eventId } = await params;
    const body: Partial<EventPayload> = await request.json();

    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    // Si le slug change, vérifier l'unicité
    let slug = existing.slug;
    if (body.slug && body.slug !== existing.slug) {
      slug = slugify(body.slug);
      const conflict = await prisma.event.findFirst({
        where: { slug, NOT: { id: eventId } },
      });
      if (conflict) {
        return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 409 });
      }
    } else if (body.title && body.title !== existing.title && !body.slug) {
      slug = uniqueSlug(slugify(body.title));
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.slug && { slug }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/events/[eventId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── DELETE /api/events/[eventId]
// Admin — supprime un événement (cascade sessions + questions)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { eventId } = await params;

    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id: eventId } });

    return NextResponse.json({ message: "Événement supprimé" });
  } catch (error) {
    console.error("[DELETE /api/events/[eventId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
