import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { Prisma } from "@/generated/prisma/client";

type Params = { params: Promise<{ questionId: string }> };

async function findQuestion(questionId: string) {
  return prisma.question.findUnique({
    where: { id: questionId },
  });
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { questionId } = await params;
    const existing = await findQuestion(questionId);
    if (!existing) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    if (existing.isHidden) {
      return NextResponse.json({ error: "Question indisponible" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      const upvote = await tx.questionUpvote.findUnique({
        where: {
          userId_questionId: {
            userId: session.user.id,
            questionId,
          },
        },
      });

      if (upvote) {
        throw new UniqueUpvoteError();
      }

      await tx.questionUpvote.create({
        data: {
          userId: session.user.id,
          questionId,
        },
      });
      await tx.question.update({
        where: { id: questionId },
        data: { upvotes: { increment: 1 } },
      });
    });

    const updated = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, upvotes: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof UniqueUpvoteError) {
      return NextResponse.json({ error: "Vous avez déjà voté pour cette question" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: "Vous avez déjà voté pour cette question" }, { status: 409 });
    }
    console.error("[POST /api/questions/[questionId]/upvote]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

class UniqueUpvoteError extends Error {
  constructor() { super("Unique upvote"); }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { questionId } = await params;
    const existing = await findQuestion(questionId);
    if (!existing) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const upvote = await tx.questionUpvote.findUnique({
        where: {
          userId_questionId: {
            userId: session.user.id,
            questionId,
          },
        },
      });

      if (!upvote) {
        throw new MissingUpvoteError();
      }

      await tx.questionUpvote.delete({ where: { id: upvote.id } });
      await tx.question.update({
        where: { id: questionId },
        data: { upvotes: { decrement: 1 } },
      });
    });

    const updated = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, upvotes: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof MissingUpvoteError) {
      return NextResponse.json({ error: "Vous n'avez pas voté pour cette question" }, { status: 404 });
    }
    console.error("[DELETE /api/questions/[questionId]/upvote]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

class MissingUpvoteError extends Error {
  constructor() { super("Missing upvote"); }
}
