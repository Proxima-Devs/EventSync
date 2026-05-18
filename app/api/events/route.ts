import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify, uniqueSlug } from "@/lib/slugify";
import type { EventPayload } from "@/types";

// ── GET /api/events
// Public — liste tous les événements (triés par date de début desc)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const perPage = parseInt(searchParams.get("perPage") ?? "20");
    const skip = (page - 1) * perPage;

    const events = await prisma.event.findMany({
      orderBy: { startDate: "desc" },
      skip,
      take: perPage,
      include: {
        _count: { select: { sessions: true } },
      },
    });
    const total = await prisma.event.count();

    return NextResponse.json({
      data: events,
      meta: { total, page, perPage },
    });
  } catch (error) {
    console.error("[GET /api/events]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── POST /api/events
// Admin — crée un événement
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body: EventPayload = await request.json();
    const { title, description, startDate, endDate, location, coverImage } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Champs obligatoires : title, startDate, endDate" },
        { status: 400 }
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "startDate doit être antérieure à endDate" },
        { status: 400 }
      );
    }

    // Génération du slug unique
    let slug = body.slug ? slugify(body.slug) : slugify(title);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) slug = uniqueSlug(slug);

    const event = await prisma.event.create({
      data: {
        title,
        description,
        slug,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        coverImage,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("[POST /api/events]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
