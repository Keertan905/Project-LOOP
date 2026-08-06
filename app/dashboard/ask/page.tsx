"use client";

import { useState, useRef, useEffect } from "react";

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

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
          ...prev,
          {
            question: query,
            answer: data.answer,
            sources: data.sources,
          },
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
    <main className="h-screen flex flex-col w-full p-4 md:p-8 overflow-hidden bg-slate-50">
      {/* Header - Static when chat is active */}
      {history.length > 0 && (
        <div className="w-full border-b border-slate-200 pb-4 mb-4 shrink-0 animate-fade-in">
          <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Ask LOOP AI</h1>
              <span className="text-[10px] bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Grounded RAG
              </span>
            </div>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <span>Clear Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto pr-1 md:pr-4 space-y-6 scroll-smooth min-h-0 w-full">
        {history.length === 0 ? (
          /* Welcome State (Centered) */
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8 animate-fade-in my-auto py-8">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
              <div className="relative bg-gradient-to-tr from-indigo-600 to-purple-600 p-4 rounded-2xl text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l3.593-1.606a9 9 0 0 0 8.163-12.871M12 3c3.812 0 7.02 2.424 8.162 5.794a9.07 9.07 0 0 1-5.904 12.113L12 21M9.813 15.904a8.966 8.966 0 0 1-2.3-5.385m2.3 5.385a9.07 9.07 0 0 1-2.022-2.113m0 0a9 9 0 0 1 12.113-5.904m-12.113 5.904A8.966 8.966 0 0 1 3 12c0-2.3.86-4.395 2.29-6.002" />
                </svg>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-3">
                <span>Ask LOOP AI</span>
                <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Grounded RAG
                </span>
              </h1>
              <p className="text-slate-600 text-sm md:text-base max-w-lg mx-auto font-medium">
                Ask questions in plain English and get answers grounded strictly in your workspace feedback data.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs w-full space-y-6">
              <form onSubmit={(e) => handleSubmit(e)} className="flex gap-3">
                <input
                  type="text"
                  required
                  disabled={loading}
                  placeholder="e.g. What are the main complaints about slow loading speeds?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white disabled:opacity-50 font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></span>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Ask AI</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="space-y-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Suggested Questions to get you started</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      disabled={loading}
                      onClick={() => handleSubmit(undefined, q)}
                      className="text-xs text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl p-3.5 transition-all text-left disabled:opacity-50 cursor-pointer shadow-xs hover:border-indigo-300 flex items-start gap-2.5 font-medium"
                    >
                      <span className="text-purple-600 mt-0.5 font-bold">✨</span>
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Conversation History */
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {history.map((msg, i) => (
              <div key={i} className="space-y-4 animate-fade-in">
                {/* User Question Block (High Contrast Dark Slate Card) */}
                <div className="flex gap-3 justify-end">
                  <div className="max-w-[80%] bg-indigo-600 text-white font-semibold px-4 py-3 rounded-2xl text-sm shadow-md rounded-tr-none">
                    <span className="text-[9px] text-indigo-200 font-bold block mb-1 uppercase tracking-wider">Question</span>
                    {msg.question}
                  </div>
                </div>

                {/* AI Response Block (Crisp White Card) */}
                <div className="flex gap-3 justify-start">
                  <div className="max-w-[95%] bg-white border border-slate-200 p-5 md:p-6 rounded-2xl space-y-4 shadow-xs w-full rounded-tl-none">
                    <div className="flex items-center gap-2">
                      <span className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-1.5 rounded-lg text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l3.593-1.606a9 9 0 0 0 8.163-12.871M12 3c3.812 0 7.02 2.424 8.162 5.794a9.07 9.07 0 0 1-5.904 12.113L12 21M9.813 15.904a8.966 8.966 0 0 1-2.3-5.385m2.3 5.385a9.07 9.07 0 0 1-2.022-2.113m0 0a9 9 0 0 1 12.113-5.904m-12.113 5.904A8.966 8.966 0 0 1 3 12c0-2.3.86-4.395 2.29-6.002" />
                        </svg>
                      </span>
                      <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Grounded Response</span>
                    </div>
                    
                    <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="max-w-4xl mx-auto w-full flex justify-start py-2 animate-pulse">
            <div className="max-w-[90%] bg-white border border-slate-200 p-5 rounded-2xl space-y-3 w-full rounded-tl-none flex items-center gap-3">
              <span className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent"></span>
              <p className="text-xs text-slate-600 font-semibold">Grounding feedback & generating response...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto w-full p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full">
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area fixed at the bottom when chat is active */}
      {history.length > 0 && (
        <div className="shrink-0 pt-4 border-t border-slate-200 bg-slate-50 animate-fade-in w-full">
          <div className="max-w-4xl mx-auto w-full">
            <form onSubmit={(e) => handleSubmit(e)} className="flex gap-3">
              <input
                type="text"
                required
                disabled={loading}
                placeholder="Ask another question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></span>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Ask AI</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
