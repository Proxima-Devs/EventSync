import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify } from "@/lib/slugify";
import { Prisma } from "@/generated/prisma/client";
import type { RoomPayload } from "@/types";

type Params = { params: Promise<{ roomId: string }> };

// ── GET /api/rooms/[roomId]
// Public — détail d'une salle
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { roomId } = await params;
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        _count: { select: { sessions: true } },
        sessions: {
          include: {
            event: { select: { id: true, title: true } },
            speakers: {
              include: { speaker: { select: { id: true, fullName: true } } },
            },
          },
          orderBy: { startTime: "asc" },
        },
      },
    });
    if (!room) {
      return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
    }
    return NextResponse.json(room);
  } catch (error) {
    console.error("[GET /api/rooms/[roomId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── PUT /api/rooms/[roomId] 
// Admin — met à jour une salle
export async function PUT(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { roomId } = await params;

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

  const existing = await prisma.room.findUnique({ where: { id: roomId } });
  if (!existing) {
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  }

  const conflict = await prisma.room.findFirst({
    where: { name: name.trim(), NOT: { id: roomId } },
  });
  if (conflict) {
    return NextResponse.json({ error: "Une salle avec ce nom existe déjà" }, { status: 409 });
  }

  try {
    const newSlug = name !== existing.name;

    const room = await prisma.room.update({
      where: { id: roomId },
      data: { name: name.trim(), slug: newSlug ? slugify(name) : existing.slug },
    });

    return NextResponse.json(room);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const room = await prisma.room.update({
        where: { id: roomId },
        data: { name: name.trim(), slug: `${slugify(name)}-${Date.now()}` },
      }).catch(() => null);
      if (room) return NextResponse.json(room);
    }
    console.error("[PUT /api/rooms/[roomId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── DELETE /api/rooms/[roomId]
// Admin — supprime une salle
// Les sessions associées auront leur roomId mis à null (SetNull en cascade)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { roomId } = await params;

    const existing = await prisma.room.findUnique({
      where: { id: roomId },
      include: { _count: { select: { sessions: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
    }

    if (existing._count.sessions > 0) {
      // On prévient mais on laisse Prisma gérer le SetNull
      console.warn(
        `[DELETE room] Suppression de la salle "${existing.name}" utilisée par ${existing._count.sessions} session(s).`
      );
    }

    await prisma.room.delete({ where: { id: roomId } });

    return NextResponse.json({ message: "Salle supprimée" });
  } catch (error) {
    console.error("[DELETE /api/rooms/[roomId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
