import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify } from "@/lib/slugify";
import type { RoomPayload } from "@/types";

// ── GET /api/rooms
// Public — liste toutes les salles
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { sessions: true } },
      },
    });
    return NextResponse.json(rooms);
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
