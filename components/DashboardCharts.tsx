"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface ThemeCount {
  name: string;
  count: number;
}

interface SentimentData {
  name: string;
  value: number;
  color: string;
}

interface VolumeData {
  date: string;
  count: number;
}

interface ChannelCount {
  name: string;
  count: number;
}

interface DashboardChartsProps {
  stats: {
    totalCount: number;
    negativePercent: number;
    newThisWeek: number;
  };
  sentimentBreakdown: SentimentData[];
  volumeOverTime: VolumeData[];
  topThemes: ThemeCount[];
  channelDistribution: ChannelCount[];
  channels: string[];
  themes: { id: string; name: string }[];
  filters: {
    channel: string;
    sentiment: string;
    themeId: string;
    dateRange: string;
  };
}

export default function DashboardCharts({
  stats,
  sentimentBreakdown,
  volumeOverTime,
  topThemes,
  channelDistribution,
  channels,
  themes,
  filters,
}: DashboardChartsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [channel, setChannel] = useState(filters.channel);
  const [sentiment, setSentiment] = useState(filters.sentiment);
  const [themeId, setThemeId] = useState(filters.themeId);
  const [dateRange, setDateRange] = useState(filters.dateRange);

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Apply updates
    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    router.push(`/dashboard?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setChannel("");
    setSentiment("");
    setThemeId("");
    setDateRange("30d");
    router.push("/dashboard");
  };

  return (
    <div className="space-y-8">
      {/* Filters Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card-custom border border-card-border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Channel Filter */}
          <div className="flex flex-col">
            <span className="text-[11px] text-text-muted font-bold mb-1">CHANNEL</span>
            <select
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value);
                applyFilters({ channel: e.target.value });
              }}
              className="bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary min-w-[130px]"
            >
              <option value="">All Channels</option>
              {channels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="flex flex-col">
            <span className="text-[11px] text-text-muted font-bold mb-1">SENTIMENT</span>
            <select
              value={sentiment}
              onChange={(e) => {
                setSentiment(e.target.value);
                applyFilters({ sentiment: e.target.value });
              }}
              className="bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary min-w-[130px]"
            >
              <option value="">All Sentiments</option>
              <option value="POS">Positive</option>
              <option value="NEU">Neutral</option>
              <option value="NEG">Negative</option>
            </select>
          </div>

          {/* Theme Filter */}
          <div className="flex flex-col">
            <span className="text-[11px] text-text-muted font-bold mb-1">THEME</span>
            <select
              value={themeId}
              onChange={(e) => {
                setThemeId(e.target.value);
                applyFilters({ themeId: e.target.value });
              }}
              className="bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary max-w-[200px]"
            >
              <option value="">All Themes</option>
              {themes.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex flex-col">
            <span className="text-[11px] text-text-muted font-bold mb-1">TIME WINDOW</span>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                applyFilters({ dateRange: e.target.value });
              }}
              className="bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary min-w-[110px]"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Actions Button Bar */}
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary font-semibold px-3 py-1.5 rounded-lg border border-card-border hover:border-text-secondary transition-colors cursor-pointer bg-background"
            title="Export dashboard graphs to PDF"
          >
            🖨️ Export PDF
          </button>

          {(channel || sentiment || themeId || dateRange !== "30d") && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Feedback */}
        <div className="p-6 rounded-xl bg-card-custom border border-card-border flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-text-muted opacity-5 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <div className="space-y-1 z-10">
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total Feedback</span>
            <p className="text-4xl font-extrabold tracking-tight text-text-primary">{stats.totalCount}</p>
            <p className="text-xs text-text-muted">Filtered matching entries</p>
          </div>
        </div>

        {/* % Negative Feedback */}
        <div className="p-6 rounded-xl bg-card-custom border border-card-border flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-text-muted opacity-5 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
          </div>
          <div className="space-y-1 z-10">
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Negative Ratio</span>
            <p className={`text-4xl font-extrabold tracking-tight ${stats.negativePercent > 40 ? "text-status-neg" : "text-text-primary"}`}>
              {stats.negativePercent}%
            </p>
            <p className="text-xs text-text-muted">Requires attention and triaging</p>
          </div>
        </div>

        {/* New This Week */}
        <div className="p-6 rounded-xl bg-card-custom border border-card-border flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-text-muted opacity-5 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="space-y-1 z-10">
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">New This Week</span>
            <p className="text-4xl font-extrabold tracking-tight text-text-primary">+{stats.newThisWeek}</p>
            <p className="text-xs text-text-muted">Created in the last 7 days</p>
          </div>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volume over time */}
        <div className="p-6 rounded-xl bg-card-custom border border-card-border shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Volume Over Time</h3>
            <p className="text-xs text-text-muted">Daily ticket & feedback counts</p>
          </div>
          <div className="h-72 w-full">
            {volumeOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-muted">
                No data available for this range.
              </div>
            )}
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="p-6 rounded-xl bg-card-custom border border-card-border shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Sentiment Distribution</h3>
            <p className="text-xs text-text-muted">Customer feedback tone ratio</p>
          </div>
          <div className="h-72 w-full flex flex-col md:flex-row items-center justify-center gap-6">
            {stats.totalCount > 0 ? (
              <>
                <div className="h-56 w-56 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--card-border)",
                          color: "var(--text-primary)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="flex flex-col gap-3">
                  {sentimentBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <div>
                        <p className="text-xs font-semibold text-text-secondary">{item.name}</p>
                        <p className="text-xs text-text-muted">
                          {item.value} entries ({Math.round((item.value / stats.totalCount) * 100)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-muted">
                No sentiment data available.
              </div>
            )}
          </div>
        </div>

        {/* Top Themes */}
        <div className="p-6 rounded-xl bg-card-custom border border-card-border shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Top Feedback Themes</h3>
            <p className="text-xs text-text-muted">Most frequent topics classified by AI</p>
          </div>
          <div className="h-80 w-full">
            {topThemes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topThemes} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={10} tickLine={false} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--card-border)",
                      color: "var(--text-primary)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20}>
                    {topThemes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "var(--primary)" : "var(--ai-accent)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-muted">
                No theme classification data available.
              </div>
            )}
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="p-6 rounded-xl bg-card-custom border border-card-border shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Channel Distribution</h3>
            <p className="text-xs text-text-muted">Inbound feedback count by platform</p>
          </div>
          <div className="h-80 w-full">
            {channelDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
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
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30}>
                    {channelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "var(--primary)" : "var(--ai-accent)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-text-muted">
                No channel distribution data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
