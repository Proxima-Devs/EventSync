import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ eventId: string }> };

/**
 * GET /api/events/[eventId]/rooms
 *
 * ENDPOINT SUGGÉRÉ — retourne uniquement les salles utilisées
 * dans les sessions d'un événement spécifique.
 * Utile pour peupler le filtre par salle sur la page planning.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { eventId } = await params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    // Récupère les salles distinctes utilisées dans cet événement
    const sessions = await prisma.eventSession.findMany({
      where: { eventId, roomId: { not: null } },
      select: { room: true },
      distinct: ["roomId"],
    });

    const rooms = sessions
      .map((s) => s.room)
      .filter(Boolean)
      .sort((a, b) => a!.name.localeCompare(b!.name));

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("[GET /api/events/[eventId]/rooms]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
