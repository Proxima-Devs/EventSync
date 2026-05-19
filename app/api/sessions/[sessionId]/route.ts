import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, isSessionLive } from "@/lib/auth-utils";
import { slugify } from "@/lib/slugify";
import type { SessionPayload } from "@/types";

type Params = { params: Promise<{ sessionId: string }> };

// Fonction pour générer un slug unique
async function generateUniqueEventSessionSlug(title: string, excludeId?: string): Promise<string> {
  let slug = slugify(title);
  let counter = 1;
  
  while (true) {
    const existing = await prisma.eventSession.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) break;
    slug = `${slugify(title)}-${counter}`;
    counter++;
  }
  
  return slug;
}

// ── GET /api/sessions/[sessionId]
// Public — détail d'une session avec speakers, salle, flag live
// Accepte soit un ID soit un slug
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;

    // Essayer de trouver par slug d'abord, sinon par ID
    let session = await prisma.eventSession.findUnique({
      where: { slug: sessionId },
      include: {
        event: { select: { id: true, title: true, slug: true } },
        room: true,
        speakers: { include: { speaker: true } },
        _count: { select: { questions: true } },
      },
    });

    if (!session) {
      session = await prisma.eventSession.findUnique({
        where: { id: sessionId },
        include: {
          event: { select: { id: true, title: true, slug: true } },
          room: true,
          speakers: { include: { speaker: true } },
          _count: { select: { questions: true } },
        },
      });
    }

    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      ...session,
      isLive: isSessionLive(session.startTime, session.endTime),
      speakers: session.speakers.map((ss) => ss.speaker),
    });
  } catch (error) {
    console.error("[GET /api/sessions/[sessionId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── PUT /api/sessions/[sessionId]
// Admin — met à jour une session
export async function PUT(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { sessionId } = await params;
    const body: Partial<SessionPayload> = await request.json();

    const existing = await prisma.eventSession.findUnique({
      where: { id: sessionId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    if (body.speakerIds && body.speakerIds.length === 0) {
      return NextResponse.json(
        { error: "Une session doit avoir au moins un intervenant" },
        { status: 400 }
      );
    }

    // Générer un nouveau slug si le titre a changé
    const slug = body.title && body.title !== existing.title 
      ? await generateUniqueEventSessionSlug(body.title, sessionId) 
      : existing.slug;

    // Transaction : mise à jour session + remplacement des speakers si fournis
    const updated = await prisma.$transaction(async (tx) => {
      // Remplacement des speakers si fournis
      if (body.speakerIds) {
        await tx.sessionSpeaker.deleteMany({ where: { sessionId } });
        await tx.sessionSpeaker.createMany({
          data: body.speakerIds.map((speakerId) => ({ sessionId, speakerId })),
        });
      }

      return tx.eventSession.update({
        where: { id: sessionId },
        data: {
          ...(body.title && { title: body.title, slug }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.startTime && { startTime: new Date(body.startTime) }),
          ...(body.endTime && { endTime: new Date(body.endTime) }),
          ...(body.capacity !== undefined && { capacity: body.capacity }),
          ...(body.roomId !== undefined && {
            roomId: body.roomId || null,
          }),
        },
        include: {
          room: true,
          speakers: { include: { speaker: true } },
          _count: { select: { questions: true } },
        },
      });
    });

    return NextResponse.json({
      ...updated,
      isLive: isSessionLive(updated.startTime, updated.endTime),
      speakers: updated.speakers.map((ss) => ss.speaker),
    });
  } catch (error) {
    console.error("[PUT /api/sessions/[sessionId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── DELETE /api/sessions/[sessionId]   
// Admin — supprime une session (cascade questions)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { sessionId } = await params;

    const existing = await prisma.eventSession.findUnique({ where: { id: sessionId } });
    if (!existing) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    await prisma.eventSession.delete({ where: { id: sessionId } });

    return NextResponse.json({ message: "Session supprimée" });
  } catch (error) {
    console.error("[DELETE /api/sessions/[sessionId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
