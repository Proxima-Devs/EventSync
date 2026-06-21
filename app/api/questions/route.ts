import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function parsePagination(searchParams: URLSearchParams) {
  const start = parseInt(searchParams.get("_start") ?? searchParams.get("start") ?? "0", 10);
  const end = parseInt(searchParams.get("_end") ?? searchParams.get("end") ?? `${start + 20}`, 10);
  const perPage = end - start > 0 ? end - start : 20;
  return { start: Number.isNaN(start) ? 0 : start, take: perPage };
}

function parseSort(searchParams: URLSearchParams) {
  const field = searchParams.get("_sort") ?? "createdAt";
  const order = (searchParams.get("_order") ?? "ASC").toLowerCase() === "desc" ? "desc" : "asc";
  return { field, order };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { start, take } = parsePagination(searchParams);
    const { field, order } = parseSort(searchParams);
    const sessionId = searchParams.get("sessionId");

    const where = {
      ...(sessionId ? { sessionId } : undefined),
    };

    const questions = await prisma.question.findMany({
      where,
      skip: start,
      take,
      orderBy: { [field]: order },
      include: {
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

    const total = await prisma.question.count({ where });
    return NextResponse.json({ data: questions, meta: { total } });
  } catch (error) {
    console.error("[GET /api/questions]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ── POST /api/questions
// Admin — crée une question (useful for admin panel)
export async function POST(request: NextRequest) {
  const guard = null; // no admin guard for admin UI or adjust as needed
  try {
    const body = await request.json();
    const { content, authorName, sessionId } = body;
    if (!content || !sessionId) {
      return NextResponse.json({ error: "sessionId et content sont requis" }, { status: 400 });
    }

    const session = await prisma.eventSession.findUnique({ where: { id: sessionId } });
    if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

    const question = await prisma.question.create({
      data: { content: content.trim(), authorName: authorName?.trim() || null, sessionId },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("[POST /api/questions]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
