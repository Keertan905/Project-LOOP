"use client";

import { useState } from "react";

interface Source {
  id: string;
  content: string;
  channel: string;
  customerLabel: string | null;
}

interface ChatMessage {
  question: string;
  answer: string;
  sources: Source[];
}

const SUGGESTED_QUESTIONS = [
  "What are users saying about onboarding?",
  "Are there any billing or pricing complaints?",
  "How is the mobile app experience?",
  "What do users think of SSO and security?",
];

export default function AskLoopPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const query = (customQuestion || question).trim();
    if (!query) return;

    setLoading(true);
    setError("");
    if (!customQuestion) setQuestion("");

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      const data = await res.json();

      if (res.ok) {
        setHistory((prev) => [
          {
            question: query,
            answer: data.answer,
            sources: data.sources,
          },
          ...prev,
        ]);
      } else {
        setError(data.error || "Failed to generate answer");
      }
    } catch {
      setError("Network error communicating with AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 space-y-6 max-w-4xl mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-1.5 animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary flex items-center gap-2">
          <span>Ask LOOP AI</span>
          <span className="text-xs bg-ai-accent/10 text-ai-accent border border-ai-accent/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Grounded RAG
          </span>
        </h1>
        <p className="text-text-secondary text-sm">
          Ask questions in plain English and get answers grounded strictly in your workspace feedback data.
        </p>
      </div>

      {/* Main chat entry */}
      <div className="bg-card-custom border border-card-border rounded-xl p-6 shadow-sm space-y-4 shrink-0 animate-fade-in">
        <form onSubmit={(e) => handleSubmit(e)} className="flex gap-3">
          <input
            type="text"
            required
            disabled={loading}
            placeholder="e.g. What are the main complaints about slow loading speeds?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-background border border-card-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {loading ? "Analyzing..." : "Ask AI"}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Suggested Questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                disabled={loading}
                onClick={() => handleSubmit(undefined, q)}
                className="text-xs text-text-secondary hover:text-text-primary bg-background hover:bg-card-custom border border-card-border rounded-lg px-3 py-1.5 transition-colors text-left disabled:opacity-50 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-status-neg/10 border border-status-neg/20 text-status-neg text-sm shrink-0">
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12 shrink-0">
          <div className="flex flex-col items-center gap-3">
            <span className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent"></span>
            <p className="text-xs text-text-muted font-semibold">Retrieving matching feedback & summarizing...</p>
          </div>
        </div>
      )}

      {/* Responses list */}
      <div className="space-y-8 flex-1">
        {history.map((msg, i) => (
          <div key={i} className="space-y-4 animate-fade-in">
            {/* User message block */}
            <div className="flex gap-3 justify-end">
              <div className="max-w-[85%] bg-background border border-card-border px-4 py-2.5 rounded-2xl text-sm text-text-primary shadow-sm">
                <span className="text-[10px] text-text-muted font-bold block mb-0.5 uppercase">Question</span>
                {msg.question}
              </div>
            </div>

            {/* AI Response block */}
            <div className="flex gap-3 justify-start">
              <div className="max-w-[90%] bg-card-custom border border-card-border p-6 rounded-2xl space-y-4 shadow-sm w-full">
                <span className="text-[10px] text-ai-accent font-bold block uppercase tracking-wider">Grounded Response</span>
                
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {msg.answer}
                </div>

                {/* Sources list */}
                <div className="pt-4 border-t border-card-border space-y-2">
                  <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Grounding References</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {msg.sources.map((src, sIdx) => (
                      <div key={src.id} className="bg-background border border-card-border p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-ai-accent font-bold uppercase">[Source {sIdx + 1}]</span>
                          <span className="bg-card-custom text-text-secondary border border-card-border px-1.5 py-0.2 rounded font-bold">
                            {src.channel}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed" title={src.content}>
                          &ldquo;{src.content}&rdquo;
                        </p>
                        {src.customerLabel && (
                          <p className="text-[9px] text-text-muted italic">
                            Customer: {src.customerLabel}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {history.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-text-muted space-y-2 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-text-muted/60">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025 4.486 4.486 0 0 0-.256-2.148C3.125 15.65 3 13.882 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            <p className="text-sm font-semibold text-text-primary">No questions asked yet</p>
            <p className="text-xs text-text-muted">Type a query above or click a suggestion to start the AI analysis.</p>
          </div>
        )}
      </div>
    </main>
  );
}
