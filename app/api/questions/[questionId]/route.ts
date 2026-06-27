import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

type Params = { params: Promise<{ questionId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { questionId } = await params;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
          select: { id: true, content: true, authorName: true, createdAt: true },
        },
        session: {
          select: {
            id: true,
            title: true,
            slug: true,
            event: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("[GET /api/questions/[questionId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── PUT /api/questions/[questionId]
// Admin — met à jour une question
export async function PUT(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { questionId } = await params;
    const { content, authorName, isHidden }: {
      content?: string;
      authorName?: string | null;
      isHidden?: boolean;
    } = await request.json();

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...(content !== undefined && { content: content.trim() }),
        ...(authorName !== undefined && { authorName: authorName?.trim() || null }),
        ...(isHidden !== undefined && { isHidden }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/questions/[questionId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/questions/[questionId]
 * ENDPOINT SUGGÉRÉ — suppression définitive par l'admin.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { questionId } = await params;

    const existing = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existing) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    await prisma.question.delete({ where: { id: questionId } });

    return NextResponse.json({ message: "Question supprimée" });
  } catch (error) {
    console.error("[DELETE /api/questions/[questionId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH /api/questions/[questionId]
 * ENDPOINT SUGGÉRÉ — masquage/affichage d'une question (modération).
 * Body: { isHidden: boolean }
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { questionId } = await params;
    const { isHidden }: { isHidden: boolean } = await request.json();

    const existing = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existing) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: { isHidden },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/questions/[questionId]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
