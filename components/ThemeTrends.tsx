"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sentiment: string;
  sentimentScore: number;
  createdAt: string;
  customerLabel: string | null;
}

interface ThemeWithStats {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  totalCount: number;
  currentPeriodCount: number;
  previousPeriodCount: number;
  spikeRate: number;
  dailyCounts: { date: string; count: number }[];
  feedbacks: FeedbackItem[];
}

interface ThemeTrendsProps {
  initialThemes: ThemeWithStats[];
}

export default function ThemeTrends({ initialThemes }: ThemeTrendsProps) {
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(
    initialThemes.length > 0 ? initialThemes[0].id : null
  );

  const selectedTheme = initialThemes.find((t) => t.id === selectedThemeId);

  const getThemeBorderColor = (color: string | null) => {
    switch (color) {
      case "indigo": return "border-l-primary";
      case "red": return "border-l-status-neg";
      case "purple": return "border-l-ai-accent";
      case "orange": return "border-l-status-neu";
      case "emerald": return "border-l-status-pos";
      default: return "border-l-slate-400";
    }
  };

  const getSpikeBadge = (rate: number) => {
    if (rate > 20) {
      return (
        <span className="bg-status-neg/10 text-status-neg border border-status-neg/20 px-2.5 py-0.5 rounded text-[10px] font-bold animate-pulse">
          🔥 SPIKE ALERT (+{Math.round(rate)}%)
        </span>
      );
    } else if (rate > 0) {
      return (
        <span className="bg-status-neu/10 text-status-neu border border-status-neu/20 px-2.5 py-0.5 rounded text-[10px] font-bold">
          📈 GROWING (+{Math.round(rate)}%)
        </span>
      );
    } else if (rate < 0) {
      return (
        <span className="bg-card-custom text-text-secondary border border-card-border px-2.5 py-0.5 rounded text-[10px] font-bold">
          📉 DECREASING ({Math.round(rate)}%)
        </span>
      );
    }
    return (
      <span className="bg-card-custom text-text-muted border border-card-border px-2.5 py-0.5 rounded text-[10px] font-bold">
        STABLE
      </span>
    );
  };

  const getSentimentBadge = (sent: string) => {
    switch (sent) {
      case "POS":
        return <span className="bg-status-pos/10 text-status-pos border border-status-pos/20 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase">POS</span>;
      case "NEG":
        return <span className="bg-status-neg/10 text-status-neg border border-status-neg/20 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase">NEG</span>;
      default:
        return <span className="bg-status-neu/10 text-status-neu border border-status-neu/20 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase">NEU</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialThemes.map((theme) => {
          const isSelected = theme.id === selectedThemeId;
          return (
            <div
              key={theme.id}
              onClick={() => setSelectedThemeId(theme.id)}
              className={`p-5 rounded-xl bg-card-custom border border-card-border border-l-4 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between h-44 shadow-sm ${getThemeBorderColor(theme.color)} ${
                isSelected ? "ring-2 ring-primary/50 bg-background/30" : ""
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-text-primary text-sm md:text-base truncate">{theme.name}</h4>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                    {theme.totalCount} items
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {theme.description || "No description provided."}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-card-border/60">
                <span className="text-[10px] text-text-muted font-bold uppercase">15d Trend</span>
                {getSpikeBadge(theme.spikeRate)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill Down View */}
      {selectedTheme ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Theme Chart Volume over time */}
          <div className="lg:col-span-2 bg-card-custom border border-card-border rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                &ldquo;{selectedTheme.name}&rdquo; Activity Volume
              </h3>
              <p className="text-xs text-text-muted">Daily frequency of feedback classified under this theme</p>
            </div>

            <div className="h-64 w-full">
              {selectedTheme.dailyCounts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedTheme.dailyCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--card-border)",
                        color: "var(--text-primary)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-text-muted">
                  No trend data available for this theme.
                </div>
              )}
            </div>
          </div>

          {/* Theme Quick Summary */}
          <div className="bg-card-custom border border-card-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Theme Details</h4>
              <div className="space-y-1.5">
                <p className="text-xs text-text-muted font-bold">NAME</p>
                <p className="text-base font-bold text-text-primary">{selectedTheme.name}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-text-muted font-bold">DESCRIPTION</p>
                <p className="text-xs text-text-secondary leading-relaxed">{selectedTheme.description || "None"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-card-border">
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase">Total</p>
                  <p className="text-xl font-bold text-text-primary">{selectedTheme.totalCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase">15d Count</p>
                  <p className="text-xl font-bold text-primary">{selectedTheme.currentPeriodCount}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-card-border flex items-center justify-between">
              <span className="text-[10px] text-text-muted uppercase font-bold">Theme Color Code</span>
              <span className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: selectedTheme.color || "var(--text-muted)" }}></span>
                {selectedTheme.color || "Default Slate"}
              </span>
            </div>
          </div>

          {/* Drill Down Feedback List */}
          <div className="lg:col-span-3 bg-card-custom border border-card-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-card-border bg-background/50">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Drill-Down: Feedback classified under &ldquo;{selectedTheme.name}&rdquo;
              </h3>
              <p className="text-xs text-text-muted">Individual entries tagged with this theme by the AI engine</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background/80 border-b border-card-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="py-3.5 px-6 min-w-[100px]">Sentiment</th>
                    <th className="py-3.5 px-6 min-w-[300px]">Feedback Content</th>
                    <th className="py-3.5 px-6 min-w-[150px]">Channel</th>
                    <th className="py-3.5 px-6 min-w-[150px]">Customer</th>
                    <th className="py-3.5 px-6 text-right">Ingestion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-xs text-text-secondary">
                  {selectedTheme.feedbacks.length > 0 ? (
                    selectedTheme.feedbacks.map((f) => (
                      <tr key={f.id} className="hover:bg-background/40 transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-1.5">
                            {getSentimentBadge(f.sentiment)}
                            <span className="font-semibold text-text-muted">{f.sentimentScore.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-text-primary max-w-[400px]">
                          <p className="line-clamp-2 leading-relaxed whitespace-pre-line">{f.content}</p>
                        </td>
                        <td className="py-3 px-6">
                          <span className="px-2 py-0.5 rounded bg-background border border-card-border text-[10px] font-bold text-text-primary">
                            {f.channel}
                          </span>
                        </td>
                        <td className="py-3 px-6 font-semibold">
                          {f.customerLabel || <span className="text-text-muted italic">Unknown</span>}
                        </td>
                        <td className="py-3 px-6 text-right text-text-muted">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-muted italic">
                        No feedback items mapped to this theme yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted italic">
          No themes available in this workspace. Create some feedback to cluster them into themes.
        </div>
      )}
    </div>
  );
}
