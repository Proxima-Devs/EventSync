"use client";

import { useState, useEffect } from "react";

interface Question {
  id: string;
  content: string;
  authorName: string | null;
  upvotes: number;
  createdAt: string;
}

interface Props {
  sessionId: string;
  isLive: boolean;
}

function refreshQuestions(
  sessionId: string,
  onSuccess: (q: Question[]) => void
) {
  fetch(`/api/sessions/${sessionId}/questions`)
    .then((r) => r.json())
    .then((data) => onSuccess(data.questions ?? []))
    .catch(() => {});
}

export default function QuestionSection({ sessionId, isLive }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/questions`);
        const data = await res.json();
        if (!cancelled) setQuestions(data.questions ?? []);
      } catch (e) {
        console.error("Failed to load questions:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    if (!isLive) return () => { cancelled = true; };

    const interval = setInterval(() => {
      fetch(`/api/sessions/${sessionId}/questions`)
        .then((r) => r.json())
        .then((data) => { if (!cancelled) setQuestions(data.questions ?? []); })
        .catch(() => {});
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
      refreshQuestions(sessionId, setQuestions);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erreur réseau");
    } finally {
      setPosting(false);
    }
  }

  function handleUpvoteToggle(questionId: string) {
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

    fetch(`/api/questions/${questionId}/upvote`, {
      method: alreadyUpvoted ? "DELETE" : "POST",
    }).catch(() => {
      setUpvoted((prev) => {
        const next = new Set(prev);
        if (alreadyUpvoted) {
          next.add(questionId);
        } else {
          next.delete(questionId);
        }
        return next;
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, upvotes: q.upvotes + (alreadyUpvoted ? 1 : -1) }
            : q
        )
      );
    });
  }

  return (
    <div>
      <h2 className="text-lg text-white font-black mb-5">
        💬 {isLive ? "Questions en direct" : "Questions"}
      </h2>

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
                <div
                  key={q.id}
                  className="flex gap-4 rounded-xl border border-[#1e2530] bg-[#080d13] p-4"
                >
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
              );
            })}
        </div>
      )}
    </div>
  );
}