import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isSessionLive } from "@/lib/auth-utils";
import type { QuestionPayload } from "@/types";

type Params = { params: Promise<{ sessionId: string }> };

// ── GET /api/sessions/[sessionId]/questions 
// Public — liste des questions triées par upvotes desc
// Paramètre: ?includeHidden=true (admin uniquement, à sécuriser côté client)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;

    const session = await prisma.eventSession.findUnique({
      where: { id: sessionId },
      select: { id: true, startTime: true, endTime: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    const questions = await prisma.question.findMany({
      where: {
        sessionId,
        isHidden: false, // on ne montre pas les questions masquées en public
      },
      orderBy: [
        { upvotes: "desc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({
      isLive: isSessionLive(session.startTime, session.endTime),
      questions,
    });
  } catch (error) {
    console.error("[GET /api/sessions/[sessionId]/questions]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── POST /api/sessions/[sessionId]/questions
// Public — poste une question (uniquement si session en cours)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const body: QuestionPayload = await request.json();
    const { content, authorName } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Le contenu de la question est obligatoire" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "La question ne peut pas dépasser 500 caractères" },
        { status: 400 }
      );
    }

    const session = await prisma.eventSession.findUnique({
      where: { id: sessionId },
      select: { startTime: true, endTime: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    // Règle métier : questions uniquement pendant la session live
    if (!isSessionLive(session.startTime, session.endTime)) {
      return NextResponse.json(
        { error: "Les questions ne sont acceptées que pendant la session en cours" },
        { status: 403 }
      );
    }

    const question = await prisma.question.create({
      data: {
        content: content.trim(),
        authorName: authorName?.trim() || null,
        sessionId,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("[POST /api/sessions/[sessionId]/questions]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
