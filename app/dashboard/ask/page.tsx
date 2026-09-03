"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Plus, Trash2, Send, History, Trash } from "lucide-react";

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

interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
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
  
  // Threads state
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load threads from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("loop_chat_threads");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setThreads(parsed);
        } catch (e) {
          console.error("Error parsing stored chat threads:", e);
        }
      }
    }
  }, []);

  // Save threads to localStorage on change
  const saveThreads = (updatedThreads: ChatThread[]) => {
    setThreads(updatedThreads);
    localStorage.setItem("loop_chat_threads", JSON.stringify(updatedThreads));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const handleNewChat = () => {
    setHistory([]);
    setActiveThreadId(null);
    setQuestion("");
    setError("");
  };

  const handleSelectThread = (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      setActiveThreadId(thread.id);
      setHistory(thread.messages);
      setQuestion("");
      setError("");
    }
  };

  const handleDeleteThread = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    const updated = threads.filter((t) => t.id !== threadId);
    saveThreads(updated);
    if (activeThreadId === threadId) {
      handleNewChat();
    }
  };

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
        const newMsg: ChatMessage = {
          question: query,
          answer: data.answer,
          sources: data.sources,
        };

        const updatedHistory = [...history, newMsg];
        setHistory(updatedHistory);

        // Update threads storage
        let updatedThreads = [...threads];
        if (activeThreadId) {
          // Append to active thread
          updatedThreads = threads.map((t) => {
            if (t.id === activeThreadId) {
              return {
                ...t,
                messages: updatedHistory,
              };
            }
            return t;
          });
        } else {
          // Create new thread
          const newThread: ChatThread = {
            id: `thread_${Date.now()}`,
            title: query.length > 30 ? `${query.substring(0, 30)}...` : query,
            createdAt: new Date().toISOString(),
            messages: [newMsg],
          };
          updatedThreads = [newThread, ...threads];
          setActiveThreadId(newThread.id);
        }
        saveThreads(updatedThreads);
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
    <main className="h-screen flex w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* 1. SIDEBAR PANEL: CHAT HISTORY */}
      <div className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/15 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Chat Thread
          </button>
        </div>

        {/* Sidebar Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider px-2 py-1 flex items-center gap-1 select-none">
            <History className="w-3 h-3" />
            <span>Chat History</span>
          </div>

          {threads.length === 0 ? (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-8 select-none font-medium">
              No threads saved yet.
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between group transition-all cursor-pointer ${
                  activeThreadId === thread.id
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <span className="truncate pr-2">{thread.title}</span>
                <span 
                  onClick={(e) => handleDeleteThread(e, thread.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. CHAT LAYOUT COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Chat Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Ask LOOP AI</h1>
            <span className="text-[9px] bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider select-none">
              Grounded RAG
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile-only new chat trigger */}
            <button
              onClick={handleNewChat}
              className="md:hidden p-2 rounded-lg bg-indigo-600 text-white shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
            
            {history.length > 0 && (
              <button
                onClick={handleNewChat}
                className="text-xs text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer font-bold"
              >
                <Trash className="w-4 h-4" />
                <span className="hidden sm:inline">Reset Current Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Conversation Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth min-h-0">
          {history.length === 0 ? (
            /* Centered Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8 animate-fade-in my-auto py-8 text-center">
              <div className="relative select-none">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative bg-gradient-to-tr from-indigo-600 to-purple-600 p-4 rounded-2xl text-white shadow-lg">
                  <Sparkles className="w-9 h-9" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Ask LOOP AI
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto font-semibold leading-relaxed">
                  Ask questions in plain English and get answers grounded strictly in your workspace feedback logs.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm w-full space-y-6">
                <form onSubmit={(e) => handleSubmit(e)} className="flex gap-3">
                  <input
                    type="text"
                    required
                    disabled={loading}
                    placeholder="e.g. What are the main complaints about slow loading speeds?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50 font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></span>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>Ask AI</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Suggested Questions to get you started</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        disabled={loading}
                        onClick={() => handleSubmit(undefined, q)}
                        className="text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 bg-slate-50 dark:bg-slate-950/40 hover:bg-indigo-50/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 transition-all text-left disabled:opacity-50 cursor-pointer shadow-xs hover:border-indigo-300 flex items-start gap-2.5 font-semibold"
                      >
                        <span className="text-purple-500 dark:text-purple-400 mt-0.5 font-bold">✨</span>
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Conversation History view */
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {history.map((msg, i) => (
                <div key={i} className="space-y-4 animate-fade-in">
                  
                  {/* User Question */}
                  <div className="flex gap-3 justify-end">
                    <div className="max-w-[80%] bg-indigo-600 text-white font-bold px-4 py-3 rounded-2xl text-sm shadow-md rounded-tr-none">
                      <span className="text-[9px] text-indigo-200 font-extrabold block mb-1 uppercase tracking-wider">Question</span>
                      {msg.question}
                    </div>
                  </div>

                  {/* AI Response Card */}
                  <div className="flex gap-3 justify-start">
                    <div className="max-w-[95%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 rounded-2xl space-y-4 shadow-sm w-full rounded-tl-none">
                      <div className="flex items-center gap-2 select-none">
                        <span className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-1.5 rounded-lg text-white">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-[10px] text-purple-700 dark:text-purple-400 font-extrabold uppercase tracking-wider">Grounded Response</span>
                      </div>
                      
                      <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-semibold">
                        {msg.answer}
                      </div>

                      {/* References / Sources drawer */}
                      {msg.sources.length > 0 && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">References used to ground answer:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.sources.map((src) => (
                              <div key={src.id} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl text-left select-none">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[8px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-extrabold uppercase truncate">
                                    {src.channel}
                                  </span>
                                  <span className="text-[8px] text-slate-400 truncate">{src.customerLabel}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 italic leading-relaxed">
                                  &ldquo;{src.content}&rdquo;
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="max-w-4xl mx-auto w-full flex justify-start py-2 animate-pulse">
              <div className="max-w-[90%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 w-full rounded-tl-none flex items-center gap-3">
                <span className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent"></span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">Grounding feedback & generating response...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-4xl mx-auto w-full p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 font-semibold">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="max-w-4xl mx-auto w-full">
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input box anchored at the bottom when chat list is active */}
        {history.length > 0 && (
          <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-fade-in w-full">
            <div className="max-w-4xl mx-auto w-full">
              <form onSubmit={(e) => handleSubmit(e)} className="flex gap-3">
                <input
                  type="text"
                  required
                  disabled={loading}
                  placeholder="Ask another question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></span>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Ask AI</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}
