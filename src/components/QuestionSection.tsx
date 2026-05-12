"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

interface QuestionReply {
  id: string;
  content: string;
  authorName: string | null;
  createdAt: string;
}

interface Question {
  id: string;
  content: string;
  authorName: string | null;
  upvotes: number;
  createdAt: string;
  replies: QuestionReply[];
}

interface Props {
  sessionId: string;
  isLive: boolean;
}

function refreshQuestions(
  sessionId: string,
  onQuestions: (q: Question[]) => void,
  onUpvoted?: (ids: Set<string>) => void
) {
  fetch(`/api/sessions/${sessionId}/questions`)
    .then((r) => r.json())
    .then((data) => {
      onQuestions(data.questions ?? []);
      if (onUpvoted) {
        onUpvoted(new Set(data.upvotedQuestionIds ?? []));
      }
    })
    .catch(() => {});
}

export default function QuestionSection({ sessionId, isLive }: Props) {
  const { data: session } = authClient.useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyPosting, setReplyPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [voteError, setVoteError] = useState("");
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthorName, setReplyAuthorName] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        refreshQuestions(sessionId, (questions) => {
          if (!cancelled) {
            setQuestions(questions);
            setLoading(false);
          }
        }, (ids) => {
          if (!cancelled) setUpvoted(ids);
        });
      } catch (e) {
        console.error("Failed to load questions:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    if (!isLive) return () => { cancelled = true; };

    const interval = setInterval(() => {
      refreshQuestions(sessionId, (questions) => {
        if (!cancelled) setQuestions(questions);
      }, (ids) => {
        if (!cancelled) setUpvoted(ids);
      });
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, isLive]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          authorName: authorName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de l'envoi");
        return;
      }

      setContent("");
      setSuccess("Question envoyée !");
      refreshQuestions(sessionId, setQuestions, setUpvoted);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erreur réseau");
    } finally {
      setPosting(false);
    }
  }

  function handleReplyToggle(questionId: string) {
    setReplyTarget((current) => (current === questionId ? null : questionId));
    setReplyContent("");
    setReplyAuthorName("");
    setReplyError("");
    setReplySuccess("");
  }

  async function handleReplySubmit(questionId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim()) {
      setReplyError("La réponse est vide.");
      return;
    }

    setReplyPosting(true);
    setReplyError("");
    setReplySuccess("");

    try {
      const res = await fetch(`/api/questions/${questionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent.trim(),
          authorName: replyAuthorName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReplyError(data.error ?? "Erreur lors de l'envoi");
        return;
      }

      setReplyContent("");
      setReplyAuthorName("");
      setReplySuccess("Réponse envoyée !");
      refreshQuestions(sessionId, setQuestions, setUpvoted);
      setTimeout(() => setReplySuccess(""), 3000);
    } catch {
      setReplyError("Erreur réseau");
    } finally {
      setReplyPosting(false);
    }
  }

  async function handleUpvoteToggle(questionId: string) {
    setVoteError("");
    if (!session) {
      window.location.href = `/auth/login?callbackURL=${encodeURIComponent(window.location.href)}`;
      return;
    }

    const alreadyUpvoted = upvoted.has(questionId);

    setUpvoted((prev) => {
      const next = new Set(prev);
      if (alreadyUpvoted) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, upvotes: q.upvotes + (alreadyUpvoted ? -1 : 1) }
          : q
      )
    );

    try {
      const res = await fetch(`/api/questions/${questionId}/upvote`, {
        method: alreadyUpvoted ? "DELETE" : "POST",
      });

      if (res.status === 401) {
        window.location.href = `/auth/login?callbackURL=${encodeURIComponent(window.location.href)}`;
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setVoteError(data.error ?? "Erreur de vote");
        refreshQuestions(sessionId, setQuestions, setUpvoted);
      }
    } catch {
      setVoteError("Impossible d'enregistrer le vote. Réessayez.");
      refreshQuestions(sessionId, setQuestions, setUpvoted);
    }
  }

  return (
    <div>
      <h2 className="text-lg text-white font-black mb-5">
        💬 {isLive ? "Questions en direct" : "Questions"}
      </h2>

      {voteError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {voteError}
        </div>
      )}

      {isLive && (
        <form onSubmit={handleSubmit} className="mb-8">
          {error && (
            <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              ✓ {success}
            </div>
          )}

          <div className="mb-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Posez votre question..."
              maxLength={500}
              required
              rows={3}
              className="w-full rounded-xl border border-[#1e2530] bg-[#080d13] px-4 py-3 text-sm text-white placeholder-[#3a4550] focus:outline-none focus:border-[#00E5FF44] resize-none transition-colors"
            />
            <p className="text-xs text-[#3a4550] mt-1 text-right">
              {content.length}/500
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Votre nom (optionnel)"
              className="flex-1 rounded-xl border border-[#1e2530] bg-[#080d13] px-4 py-3 text-sm text-white placeholder-[#3a4550] focus:outline-none focus:border-[#00E5FF44] transition-colors"
            />
            <button
              type="submit"
              disabled={posting || !content.trim()}
              className="px-5 py-3 rounded-xl bg-[#00E5FF] text-black text-sm font-bold hover:bg-[#00ffff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
            >
              {posting ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 rounded-xl bg-[#1e2530]" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-[#1e2530] py-10 text-center text-[#3a4550] italic text-sm">
          {isLive
            ? "Aucune question pour l'instant. Soyez le premier !"
            : "Aucune question n'a été posée durant cette session."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions
            .slice()
            .sort((a, b) => b.upvotes - a.upvotes)
            .map((q) => {
              const voted = upvoted.has(q.id);
              return (
                <div key={q.id} className="space-y-3">
                  <div className="flex gap-4 rounded-xl border border-[#1e2530] bg-[#080d13] p-4">
                    <button
                      onClick={() => handleUpvoteToggle(q.id)}
                      className={`flex flex-col items-center justify-center gap-0.5 min-w-10 rounded-lg px-2 py-1.5 border transition-all cursor-pointer ${
                        voted
                          ? "bg-[#00E5FF15] border-[#00E5FF44] text-[#00E5FF]"
                          : "bg-transparent border-[#1e2530] text-[#3a4550] hover:text-white hover:border-[#4a5568]"
                      }`}
                      title={voted ? "Retirer mon vote" : "Voter pour cette question"}
                    >
                      <span className="text-xs leading-none">▲</span>
                      <span className="text-xs font-bold leading-none">{q.upvotes}</span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-relaxed">{q.content}</p>
                      <p className="text-xs text-[#3a4550] mt-2">
                        {q.authorName ?? "Anonyme"} ·{" "}
                        {new Date(q.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1e2530] bg-[#0b1117] p-4">
                    {q.replies.length > 0 && (
                      <div className="space-y-3 mb-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-[#4a5568]">
                          Réponses
                        </div>
                        {q.replies.map((reply) => (
                          <div key={reply.id} className="rounded-xl border border-[#1e2530] bg-[#111827] p-3">
                            <p className="text-sm text-[#d1d5db] leading-relaxed">{reply.content}</p>
                            <p className="text-xs text-[#6b7280] mt-2">
                              {reply.authorName ?? "Anonyme"} · {new Date(reply.createdAt).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleReplyToggle(q.id)}
                      className="text-sm font-semibold text-[#00E5FF] hover:text-white transition-colors"
                    >
                      {replyTarget === q.id ? "Masquer la réponse" : "Répondre à cette question"}
                    </button>

                    {replyTarget === q.id && (
                      <form onSubmit={(e) => handleReplySubmit(q.id, e)} className="space-y-3 mt-4">
                        {replyError && (
                          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {replyError}
                          </div>
                        )}
                        {replySuccess && (
                          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                            ✓ {replySuccess}
                          </div>
                        )}

                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Écrire une réponse..."
                          maxLength={500}
                          rows={3}
                          className="w-full rounded-xl border border-[#1e2530] bg-[#080d13] px-4 py-3 text-sm text-white placeholder-[#3a4550] focus:outline-none focus:border-[#00E5FF44] resize-none transition-colors"
                        />
                        <input
                          type="text"
                          value={replyAuthorName}
                          onChange={(e) => setReplyAuthorName(e.target.value)}
                          placeholder="Votre nom (optionnel)"
                          className="w-full rounded-xl border border-[#1e2530] bg-[#080d13] px-4 py-3 text-sm text-white placeholder-[#3a4550] focus:outline-none focus:border-[#00E5FF44] transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={replyPosting || !replyContent.trim()}
                          className="px-5 py-3 rounded-xl bg-[#00E5FF] text-black text-sm font-bold hover:bg-[#00ffff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {replyPosting ? "Envoi…" : "Envoyer la réponse"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}