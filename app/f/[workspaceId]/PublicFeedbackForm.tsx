"use client";

import { useState, useEffect } from "react";
import { Sparkles, Send, CheckCircle2, MessageSquare, ShieldAlert, Clock, Star } from "lucide-react";

interface PublicFeedbackFormProps {
  workspaceId: string;
  workspaceName: string;
}

interface SubmittedFeedback {
  id: string;
  content: string;
  rating?: number;
  createdAt: string;
}

const RATING_CONFIG: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: "😡", label: "Very Dissatisfied", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  2: { emoji: "🙁", label: "Dissatisfied", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  3: { emoji: "😐", label: "Neutral", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  4: { emoji: "🙂", label: "Satisfied", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  5: { emoji: "😄", label: "Very Satisfied", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
};

export default function PublicFeedbackForm({ workspaceId, workspaceName }: PublicFeedbackFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // Local history tracking
  const [pastSubmissions, setPastSubmissions] = useState<SubmittedFeedback[]>([]);

  // Load past submissions on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`loop_submissions_${workspaceId}`);
      if (stored) {
        try {
          setPastSubmissions(JSON.parse(stored));
        } catch (e) {
          console.error("Error reading past submissions:", e);
        }
      }
    }
  }, [workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback/public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          content: content.trim(),
          email: email.trim(),
          name: name.trim(),
          rating: rating > 0 ? rating : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        
        // Save to local storage history
        const newRecord: SubmittedFeedback = {
          id: data.id || `fdb_${Date.now()}`,
          content: content.trim(),
          rating: rating > 0 ? rating : undefined,
          createdAt: new Date().toISOString(),
        };
        const updated = [newRecord, ...pastSubmissions];
        setPastSubmissions(updated);
        localStorage.setItem(`loop_submissions_${workspaceId}`, JSON.stringify(updated));
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please verify your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;
  const currentRatingConfig = RATING_CONFIG[activeRating];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xl animate-fade-in animate-duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-6 shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Thank you!
          </h2>

          {rating > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <span className="text-base">{RATING_CONFIG[rating]?.emoji}</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span>({rating}/5)</span>
            </div>
          )}

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Your feedback has been successfully submitted to <span className="font-bold text-slate-800 dark:text-slate-200">{workspaceName}</span>. 
            Our product teams will review it shortly.
          </p>

          <button
            onClick={() => {
              setContent("");
              setRating(0);
              setHoverRating(0);
              setSubmitted(false);
            }}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/15"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden space-y-6">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

        {/* Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25 mb-4 shrink-0">
            <MessageSquare className="w-5.5 h-5.5" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Submit Feedback
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium leading-relaxed uppercase tracking-wider">
            Sharing with {workspaceName}
          </p>
        </div>

        {/* Error alert banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane.doe@example.com"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400"
            />
          </div>

          {/* Interactive CSAT Star & Emoji Rating Picker */}
          <div className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Overall Satisfaction (CSAT)</span>
              </label>
              {activeRating > 0 && currentRatingConfig && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 animate-fade-in ${currentRatingConfig.color}`}>
                  <span>{currentRatingConfig.emoji}</span>
                  <span>{currentRatingConfig.label}</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 py-1 select-none">
              {[1, 2, 3, 4, 5].map((starIndex) => {
                const isSelected = starIndex <= (hoverRating || rating);
                return (
                  <button
                    key={starIndex}
                    type="button"
                    onClick={() => setRating(starIndex)}
                    onMouseEnter={() => setHoverRating(starIndex)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                    aria-label={`Rate ${starIndex} out of 5 stars`}
                  >
                    <Star
                      className={`w-7 h-7 transition-all duration-150 ${
                        isSelected
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                          : "text-slate-300 dark:text-slate-700 hover:text-slate-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium mt-1">
              {activeRating === 0 ? "Click to rate your experience (optional)" : `${activeRating} of 5 stars selected`}
            </p>
          </div>

          <div>
            <label className="block mb-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Feedback Comment
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell us about your experience, report a bug, or request a feature..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </button>
        </form>

        {/* Customer Submission Tracker History */}
        {pastSubmissions.length > 0 && (
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 select-none">
              <Clock className="w-3.5 h-3.5" />
              <span>Your Submission History</span>
            </p>
            <div className="max-h-32 overflow-y-auto space-y-2 pr-1 select-none">
              {pastSubmissions.map((sub) => (
                <div 
                  key={sub.id} 
                  className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {sub.rating && sub.rating > 0 && (
                        <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">
                          {RATING_CONFIG[sub.rating]?.emoji} {sub.rating}★
                        </span>
                      )}
                      <p className="text-[10px] text-slate-700 dark:text-slate-350 truncate">
                        {sub.content}
                      </p>
                    </div>
                    <span className="text-[8px] text-slate-400 block">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 px-1.5 py-0.5 rounded font-extrabold shrink-0 uppercase tracking-wider">
                    Sent
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Brand watermark */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 select-none">
          <span>Powered by</span>
          <div className="flex items-center gap-0.5 font-extrabold uppercase text-slate-500 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>LOOP</span>
          </div>
        </div>

      </div>
    </div>
  );
}

