import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { Prisma } from "@/generated/prisma/client";
import type { EventPayload } from "@/types";

// ── GET /api/events
// Public — liste tous les événements (triés par date de début desc)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = parseInt(searchParams.get("_start") ?? "0");
    const end = parseInt(searchParams.get("_end") ?? "25");
    const take = end - start;
    const q = searchParams.get("q");

    const where = {
      ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : undefined),
    };

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip: Number.isNaN(start) ? 0 : start,
      take: Number.isNaN(take) || take <= 0 ? 25 : take,
      include: {
        _count: { select: { sessions: true } },
      },
    });
    const total = await prisma.event.count({ where });

    return NextResponse.json({
      data: events,
      meta: { total },
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

  let body: EventPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { title, description, startDate, endDate, location, coverImage } = body;

  if (!title || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Champs obligatoires : title, startDate, endDate" },
      { status: 400 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json(
      { error: "Format de date invalide" },
      { status: 400 }
    );
  }

  if (start >= end) {
    return NextResponse.json(
      { error: "startDate doit être antérieure à endDate" },
      { status: 400 }
    );
  }

  try {
    let slug = body.slug ? slugify(body.slug) : slugify(title);
    const event = await prisma.event.create({
      data: { title, description, slug, startDate: start, endDate: end, location, coverImage },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const slug = body.slug ? slugify(body.slug) : slugify(title);
      const event = await prisma.event.create({
        data: { title, description, slug: uniqueSlug(slug), startDate: start, endDate: end, location, coverImage },
      }).catch(() => null);
      if (event) return NextResponse.json(event, { status: 201 });
    }
    console.error("[POST /api/events]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}