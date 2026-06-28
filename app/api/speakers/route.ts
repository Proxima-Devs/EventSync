import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify, uniqueSlug } from "@/lib/slugify";
import type { SpeakerPayload } from "@/types";
import { Prisma } from "@/generated/prisma/client";

// ── GET /api/speakers 
// Public — liste tous les intervenants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const q = searchParams.get("q");
    const start = parseInt(searchParams.get("_start") ?? "0");
    const take = parseInt(searchParams.get("_end") ?? "25") - start;

    const where = {
      ...(eventId
        ? { sessions: { some: { session: { eventId } } } }
        : undefined),
      ...(q ? { fullName: { contains: q, mode: 'insensitive' as const } } : undefined),
    };

    const speakers = await prisma.speaker.findMany({
      where,
      skip: Number.isNaN(start) ? 0 : start,
      take: Number.isNaN(take) || take <= 0 ? 25 : take,
      include: {
        _count: { select: { sessions: true } },
      },
      orderBy: { fullName: "asc" },
    });

    const total = await prisma.speaker.count({ where });

    return NextResponse.json({ data: speakers, meta: { total } });
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

  let body: SpeakerPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { fullName, photo, bio, links } = body;

  if (!fullName || fullName.trim().length === 0) {
    return NextResponse.json(
      { error: "Le nom complet de l'intervenant est obligatoire" },
      { status: 400 }
    );
  }

  try {
    const slug = slugify(fullName);
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const speaker = await prisma.speaker.create({
        data: {
          fullName: fullName.trim(),
          slug: uniqueSlug(slugify(fullName)),
          photo: photo || null,
          bio: bio?.trim() || null,
          links: links as Prisma.InputJsonValue ?? null,
        },
      }).catch(() => null);
      if (speaker) return NextResponse.json(speaker, { status: 201 });
    }
    console.error("[POST /api/speakers]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
