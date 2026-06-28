import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify } from "@/lib/slugify";
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

// Fonction pour générer un slug unique
async function generateUniqueRoomSlug(name: string): Promise<string> {
  let slug = slugify(name);
  let counter = 1;
  
  while (true) {
    const existing = await prisma.room.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${slugify(name)}-${counter}`;
    counter++;
  }
  
  return slug;
}

// ── POST /api/rooms
// Admin — crée une salle
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body: RoomPayload = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Le nom de la salle est obligatoire" }, { status: 400 });
    }

    const existing = await prisma.room.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: "Une salle avec ce nom existe déjà" }, { status: 409 });
    }

    const slug = await generateUniqueRoomSlug(name);

    const room = await prisma.room.create({
      data: { name: name.trim(), slug },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("[POST /api/rooms]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
