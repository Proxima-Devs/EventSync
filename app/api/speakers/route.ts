import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify } from "@/lib/slugify";
import type { SpeakerPayload } from "@/types";
import { Prisma } from "@/generated/prisma/client";

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

// Fonction pour générer un slug unique
async function generateUniqueSpeakerSlug(fullName: string): Promise<string> {
  let slug = slugify(fullName);
  let counter = 1;
  
  while (true) {
    const existing = await prisma.speaker.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${slugify(fullName)}-${counter}`;
    counter++;
  }
  
  return slug;
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

    const slug = await generateUniqueSpeakerSlug(fullName);

    const speaker = await prisma.speaker.create({
      data: {
        fullName: fullName.trim(),
        slug,
        photo: photo || null,
        bio: bio?.trim() || null,
        links: links as Prisma.InputJsonValue ?? null,
      },
    });

    return NextResponse.json(speaker, { status: 201 });
  } catch (error) {
    console.error("[POST /api/speakers]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
