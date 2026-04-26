import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ questionId: string }> };

// ── POST /api/questions/[questionId]/upvote
// Public — incrémente le compteur d'upvotes d'une question
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { questionId } = await params;

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    if (existing.isHidden) {
      return NextResponse.json({ error: "Question indisponible" }, { status: 403 });
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: { upvotes: { increment: 1 } },
      select: { id: true, upvotes: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[POST /api/questions/[questionId]/upvote]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
