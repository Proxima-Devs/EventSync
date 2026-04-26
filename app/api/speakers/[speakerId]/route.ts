import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, isSessionLive } from "@/lib/auth-utils";
import type { SpeakerPayload } from "@/types";
import { Prisma } from "@/generated/prisma/client";

type Params = { params: Promise<{ speakerId: string }> };

// ── GET /api/speakers/[speakerId]  
// Public — page publique d'un intervenant avec ses sessions
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { speakerId } = await params;

    const speaker = await prisma.speaker.findUnique({
      where: { id: speakerId },
      include: {
        sessions: {
          include: {
            session: {
              include: {
                event: { select: { id: true, title: true, slug: true } },
                room: true,
              },
            },
          },
          orderBy: {
            session: { startTime: "asc" },
          },
        },
      },
    });

    if (!speaker) {
      return NextResponse.json({ error: "Intervenant introuvable" }, { status: 404 });
    }

    // Aplatit les sessions et enrichit avec isLive
    const sessions = speaker.sessions.map(({ session }) => ({
      ...session,
      isLive: isSessionLive(session.startTime, session.endTime),
    }));

    return NextResponse.json({ ...speaker, sessions });
  } catch (error) {
    console.error("[GET /api/speakers/[speakerId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── PUT /api/speakers/[speakerId]  
// Admin — met à jour un intervenant
export async function PUT(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { speakerId } = await params;
    const body: Partial<SpeakerPayload> = await request.json();

    const existing = await prisma.speaker.findUnique({ where: { id: speakerId } });
    if (!existing) {
      return NextResponse.json({ error: "Intervenant introuvable" }, { status: 404 });
    }

    const speaker = await prisma.speaker.update({
      where: { id: speakerId },
      data: {
        ...(body.fullName && { fullName: body.fullName.trim() }),
        ...(body.photo !== undefined && { photo: body.photo || null }),
        ...(body.bio !== undefined && { bio: body.bio?.trim() || null }),
        ...(body.links !== undefined && { links: body.links as Prisma.InputJsonValue ?? null }),
        
      },
    });

    return NextResponse.json(speaker);
  } catch (error) {
    console.error("[PUT /api/speakers/[speakerId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── DELETE /api/speakers/[speakerId]   
// Admin — supprime un intervenant
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { speakerId } = await params;

    const existing = await prisma.speaker.findUnique({
      where: { id: speakerId },
      include: { _count: { select: { sessions: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Intervenant introuvable" }, { status: 404 });
    }

    if (existing._count.sessions > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : l'intervenant est assigné à ${existing._count.sessions} session(s). Retirez-le d'abord des sessions.`,
        },
        { status: 409 }
      );
    }

    await prisma.speaker.delete({ where: { id: speakerId } });

    return NextResponse.json({ message: "Intervenant supprimé" });
  } catch (error) {
    console.error("[DELETE /api/speakers/[speakerId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
