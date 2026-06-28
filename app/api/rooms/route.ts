import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { Prisma } from "@/generated/prisma/client";
import type { RoomPayload } from "@/types";

// ── GET /api/rooms
// Public — liste toutes les salles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = parseInt(searchParams.get("_start") ?? "0");
    const end = parseInt(searchParams.get("_end") ?? "25");
    const take = end - start;
    const q = searchParams.get("q");

    const where = {
      ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : undefined),
    };

    const rooms = await prisma.room.findMany({
      where,
      skip: Number.isNaN(start) ? 0 : start,
      take: Number.isNaN(take) || take <= 0 ? 25 : take,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { sessions: true } },
      },
    });
    const total = await prisma.room.count({ where });
    return NextResponse.json({ data: rooms, meta: { total } });
  } catch (error) {
    console.error("[GET /api/rooms]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── POST /api/rooms
// Admin — crée une salle
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  let body: RoomPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { name } = body;

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "Le nom de la salle est obligatoire" }, { status: 400 });
  }

  try {
    const slug = slugify(name);

    const room = await prisma.room.create({
      data: { name: name.trim(), slug },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const room = await prisma.room.create({
        data: { name: name.trim(), slug: uniqueSlug(slugify(name)) },
      }).catch(() => null);
      if (room) return NextResponse.json(room, { status: 201 });
    }
    console.error("[POST /api/rooms]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
