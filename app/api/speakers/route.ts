import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import type { SpeakerPayload } from "@/types";

// ── GET /api/speakers 
// Public — liste tous les intervenants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId"); // filtre optionnel par événement

    const speakers = await prisma.speaker.findMany({
      where: eventId
        ? {
            sessions: {
              some: {
                session: { eventId },
              },
            },
          }
        : undefined,
      include: {
        _count: { select: { sessions: true } },
      },
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json(speakers);
  } catch (error) {
    console.error("[GET /api/speakers]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── POST /api/speakers
// Admin — crée un intervenant
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body: SpeakerPayload = await request.json();
    const { fullName, photo, bio, links } = body;

    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: "Le nom complet de l'intervenant est obligatoire" },
        { status: 400 }
      );
    }

    const speaker = await prisma.speaker.create({
      data: {
        fullName: fullName.trim(),
        photo: photo || null,
        bio: bio?.trim() || null,
        links: links ?? null,
      },
    });

    return NextResponse.json(speaker, { status: 201 });
  } catch (error) {
    console.error("[POST /api/speakers]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
