import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { CommentPayload } from "@/types";

type Params = { params: Promise<{ questionId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { questionId } = await params;
    const body: CommentPayload = await request.json();
    const { content, authorName } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Le contenu de la réponse est obligatoire" }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "La réponse ne peut pas dépasser 500 caractères" }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, isHidden: true },
    });
    if (!question || question.isHidden) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    const reply = await prisma.questionReply.create({
      data: {
        content: content.trim(),
        authorName: authorName?.trim() || null,
        questionId,
      },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error("[POST /api/questions/[questionId]/comments]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
