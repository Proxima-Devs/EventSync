"use client";

import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
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

function formatRelativeTime(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.max(Math.floor(diffMs / 1000), 0);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
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
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthorName, setReplyAuthorName] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        refreshQuestions(
          sessionId,
          (questions) => {
            if (!cancelled) {
              setQuestions(questions);
              setLoading(false);
            }
          },
          (ids) => {
            if (!cancelled) setUpvoted(ids);
          }
        );
      } catch (e) {
        console.error("Failed to load questions:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    if (!isLive) return () => { cancelled = true; };

    const interval = setInterval(() => {
      refreshQuestions(
        sessionId,
        (questions) => {
          if (!cancelled) setQuestions(questions);
        },
        (ids) => {
          if (!cancelled) setUpvoted(ids);
        }
      );
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
    setExpandedQuestion(questionId);
    setReplyContent("");
    setReplyAuthorName("");
    setReplyError("");
    setReplySuccess("");
  }

  function handleRepliesToggle(questionId: string) {
    setExpandedQuestion((current) => (current === questionId ? null : questionId));
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
      window.location.replace(
        `/auth/login?callbackURL=${encodeURIComponent(window.location.href)}`
      );
      return;
    }
    const alreadyUpvoted = upvoted.has(questionId);
    setUpvoted((prev) => {
      const next = new Set(prev);
      if (alreadyUpvoted) next.delete(questionId);
      else next.add(questionId);
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
        window.location.replace(
          `/auth/login?callbackURL=${encodeURIComponent(window.location.href)}`
        );
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
    <div className="font-sans text-[#e4e6eb] max-w-170">
      {/* Title */}
      <h2 className="text-base font-bold text-[#e4e6eb] mb-4">
        {isLive ? "💬 Questions en direct" : "💬 Questions"}
      </h2>
 
      {/* Vote error */}
      {voteError && (
        <div className="rounded-lg px-3.5 py-2.5 text-[0.8125rem] mb-2.5 bg-red-900/20 border border-red-600/30 text-red-400">
          {voteError}
        </div>
      )}
 
      {/* Post form */}
      {isLive && (
        <div className="mb-5 border-t border-[#1E2836] pt-3.5">
          {error && (
            <div className="rounded-lg px-3.5 py-2.5 text-[0.8125rem] mb-2.5 bg-red-900/20 border border-red-600/30 text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg px-3.5 py-2.5 text-[0.8125rem] mb-2.5 bg-green-900/20 border border-green-600/30 text-green-400">
              ✓ {success}
            </div>
          )}
 
          <div className="flex gap-2 items-start">
            <div className="flex-1 bg-[#1E2836] rounded-[20px] px-3.5 py-2 flex items-center">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Posez votre question..."
                maxLength={500}
                required
                rows={1}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }}
                className="w-full bg-transparent border-none outline-none text-[#e4e6eb] text-[0.9375rem] font-[inherit] resize-none leading-[1.4] min-h-5 overflow-hidden placeholder-[#b0b3b8]"
              />
            </div>
          </div>
 
          <div className="flex items-center gap-2 mt-2 pl-11">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Votre nom (optionnel)"
              className="flex-1 bg-[#1E2836] border-none rounded-[20px] px-3.5 py-2 text-[#e4e6eb] text-sm font-[inherit] outline-none placeholder-[#b0b3b8]"
            />
            <button
              onClick={handleSubmit}
              disabled={posting || !content.trim()}
              className="bg-[#2374e1] text-white border-none rounded-md px-3.5 py-1.75 text-sm font-semibold font-[inherit] cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-[#1a6cd4] disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {posting ? "Envoi…" : "Publier"}
            </button>
          </div>
        </div>
      )}
 
      {/* Loading skeleton */}
      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[#1E2836] animate-pulse"
            />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <p className="text-[#b0b3b8] text-sm italic text-center py-6">
          {isLive
            ? "Aucune question pour l'instant. Soyez le premier !"
            : "Aucune question n'a été posée durant cette session."}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {questions
            .slice()
            .sort((a, b) => b.upvotes - a.upvotes)
            .map((q) => {
              const voted = upvoted.has(q.id);
              const repliesOpen = expandedQuestion === q.id;
 
              return (
                <div key={q.id} className="pb-1">
                  {/* Main comment row */}
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 min-w-0 relative">
                      {/* Bubble */}
                      <div className="inline-block bg-[#1E2836] rounded-[18px] px-3.5 py-2 max-w-full">
                        <span className="block text-[0.8125rem] font-bold text-[#e4e6eb] mb-0.5">
                          {q.authorName ?? "Anonyme"}
                        </span>
                        <p className="text-[0.9375rem] text-[#e4e6eb] leading-[1.4] m-0 whitespace-pre-wrap wrap-break-word">
                          {q.content}
                        </p>
                      </div>
 
                      {/* Like badge */}
                      {q.upvotes > 0 && (
                        <div className="inline-flex items-center gap-0.75 bg-[#18191a] border-[1.5px] border-[#1E2836] rounded-2.5 px-1.5 py-0.5 text-xs text-[#b0b3b8] mt-0.75 ml-2.5">
                          <ThumbsUp size={11} className="text-[#2374e1]" />
                          <span>{q.upvotes}</span>
                        </div>
                      )}
 
                      {/* Action bar */}
                      <div className="flex items-center gap-1 px-1.5 pt-0.75 flex-wrap">
                        <button
                          onClick={() => handleUpvoteToggle(q.id)}
                          className={`inline-flex items-center gap-1 bg-transparent border-none cursor-pointer text-[0.8125rem] font-bold font-[inherit] px-1 py-0.5 rounded transition-colors duration-150 hover:bg-white/5 ${
                            voted
                              ? "text-[#2374e1] hover:text-[#1a6cd4]"
                              : "text-[#b0b3b8] hover:text-[#e4e6eb]"
                          }`}
                        >
                          <ThumbsUp size={14} />
                          J&apos;aime
                        </button>
                        <span className="text-[#4e4f50] text-xs">·</span>
                        <button
                          onClick={() => handleReplyToggle(q.id)}
                          className="inline-flex items-center gap-1 bg-transparent border-none cursor-pointer text-[0.8125rem] font-bold text-[#b0b3b8] font-[inherit] px-1 py-0.5 rounded transition-colors duration-150 hover:text-[#e4e6eb] hover:bg-white/5"
                        >
                          Répondre
                        </button>
                        <span className="text-[#4e4f50] text-xs">·</span>
                        <span className="text-xs text-[#b0b3b8] px-1 py-0.5">
                          {formatRelativeTime(q.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
 
                  {/* Replies section */}
                  {q.replies.length > 0 && (
                    <div className="pl-11 mt-0.5">
                      <button
                        onClick={() => handleRepliesToggle(q.id)}
                        className="bg-transparent border-none cursor-pointer text-[0.8125rem] font-bold text-[#b0b3b8] font-[inherit] px-1.5 py-1 rounded flex items-center gap-1.5 transition-colors duration-150 hover:text-[#e4e6eb] before:content-[''] before:inline-block before:w-5 before:h-[1.5px] before:bg-[#b0b3b8] before:rounded"
                      >
                        {repliesOpen
                          ? "Masquer les réponses"
                          : `Voir ${q.replies.length} réponse${q.replies.length > 1 ? "s" : ""}`}
                      </button>
 
                      {repliesOpen && (
                        <div className="flex flex-col gap-1 mt-1.5">
                          {q.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2 items-start">
                              <div className="flex-1 min-w-0">
                                <div className="inline-block bg-[#1E2836] rounded-[18px] px-3.5 py-2 max-w-full">
                                  <span className="block text-[0.8125rem] font-bold text-[#e4e6eb] mb-0.5">
                                    {reply.authorName ?? "Anonyme"}
                                  </span>
                                  <p className="text-[0.9375rem] text-[#e4e6eb] leading-[1.4] m-0 whitespace-pre-wrap wrap-break-word">
                                    {reply.content}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 px-1.5 pt-0.75">
                                  <span className="text-xs text-[#b0b3b8] px-1 py-0.5">
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
 
                  {/* Reply form */}
                  {replyTarget === q.id && (
                    <div className="pl-11 mt-1.5">
                      {replyError && (
                        <div className="rounded-lg px-3.5 py-2.5 text-[0.8125rem] mb-2.5 bg-red-900/20 border border-red-600/30 text-red-400">
                          {replyError}
                        </div>
                      )}
                      {replySuccess && (
                        <div className="rounded-lg px-3.5 py-2.5 text-[0.8125rem] mb-2.5 bg-green-900/20 border border-green-600/30 text-green-400">
                          ✓ {replySuccess}
                        </div>
                      )}
 
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 bg-[#1E2836] rounded-[20px] px-3.5 py-2 flex items-center">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Écrire une réponse..."
                            maxLength={500}
                            rows={1}
                            onInput={(e) => {
                              const el = e.currentTarget;
                              el.style.height = "auto";
                              el.style.height = el.scrollHeight + "px";
                            }}
                            className="w-full bg-transparent border-none outline-none text-[#e4e6eb] text-[0.9375rem] font-[inherit] resize-none leading-[1.4] min-h-5 overflow-hidden placeholder-[#b0b3b8]"
                          />
                        </div>
                      </div>
 
                      <div className="flex items-center gap-2 mt-2 pl-9">
                        <input
                          type="text"
                          value={replyAuthorName}
                          onChange={(e) => setReplyAuthorName(e.target.value)}
                          placeholder="Votre nom (optionnel)"
                          className="flex-1 bg-[#1E2836] border-none rounded-[20px] px-3.5 py-2 text-[#e4e6eb] text-sm font-[inherit] outline-none placeholder-[#b0b3b8]"
                        />
                        <button
                          onClick={(e) => handleReplySubmit(q.id, e)}
                          disabled={replyPosting || !replyContent.trim()}
                          className="bg-[#2374e1] text-white border-none rounded-md px-3.5 py-1.75 text-sm font-semibold font-[inherit] cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-[#1a6cd4] disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          {replyPosting ? "Envoi…" : "Répondre"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}