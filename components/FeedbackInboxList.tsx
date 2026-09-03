"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Sentiment = "POS" | "NEU" | "NEG";
type FeedbackStatus = "NEW" | "REVIEWED" | "ACTIONED";
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface FeedbackThemeLink {
  confidence: number;
  theme: {
    id: string;
    name: string;
    color: string | null;
  };
}

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sourceRef: string | null;
  customerLabel: string | null;
  sentiment: Sentiment;
  sentimentScore: number;
  status: FeedbackStatus;
  priority: Priority;
  createdAt: string;
  feedbackThemes: FeedbackThemeLink[];
}

interface FeedbackInboxListProps {
  initialItems: FeedbackItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  channels: string[];
  themes: { id: string; name: string }[];
  currentRole: string;
}

export default function FeedbackInboxList({
  initialItems,
  pagination,
  channels,
  themes,
  currentRole,
}: FeedbackInboxListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local feedback list state to support optimistic UI updates
  const [items, setItems] = useState<FeedbackItem[]>(initialItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);

  // Filter local states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [channel, setChannel] = useState(searchParams.get("channel") || "");
  const [sentiment, setSentiment] = useState(searchParams.get("sentiment") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [themeId, setThemeId] = useState(searchParams.get("themeId") || "");
  const [priority, setPriority] = useState(searchParams.get("priority") || "");

  const isReadOnly = currentRole === "VIEWER";



  const handleApplyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter changes

    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    router.push(`/dashboard/inbox?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard/inbox?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyFilters({ search });
  };

  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    if (isReadOnly) return;
    setUpdatingId(id);

    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
        toast.success("Status updated successfully");
      } else {
        const err = await res.json();
        toast.error(`Failed to update status: ${err.error || "Unknown error"}`);
      }
    } catch {
      toast.error("Network error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Bulk selection and clear all states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (isReadOnly || selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} marked feedback items?`)) return;

    setIsBulkDeleting(true);

    try {
      const res = await fetch("/api/feedback/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || `Deleted ${selectedIds.length} feedback items`);
        setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete selected feedback");
      }
    } catch {
      toast.error("Network error deleting selected feedback");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleClearAllInbox = async () => {
    if (isReadOnly) return;
    setIsPurging(true);

    try {
      const res = await fetch("/api/feedback/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || "All inbox feedback has been cleared!");
        setItems([]);
        setSelectedIds([]);
        setShowClearModal(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to clear inbox history");
      }
    } catch {
      toast.error("Network error clearing inbox history");
    } finally {
      setIsPurging(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (isReadOnly) return;
    if (!confirm("Are you sure you want to delete this feedback item?")) return;

    setUpdatingId(id);

    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Feedback deleted successfully");
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete feedback");
      }
    } catch {
      toast.error("Network error deleting feedback");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) {
      toast.error("No feedback items to export");
      return;
    }

    try {
      const headers = ["ID", "Content", "Channel", "Customer Label", "Sentiment", "Sentiment Score", "Status", "Priority", "Created At"];

      const rows = items.map(item => [
        item.id,
        `"${item.content.replace(/"/g, '""')}"`,
        item.channel,
        item.customerLabel ? `"${item.customerLabel.replace(/"/g, '""')}"` : "",
        item.sentiment,
        item.sentimentScore.toFixed(4),
        item.status,
        item.priority,
        item.createdAt
      ]);

      const csvString = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `loop_feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV file exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const handleReclassify = async (id: string) => {
    if (isReadOnly) return;
    setReclassifyingId(id);

    try {
      const res = await fetch(`/api/feedback/${id}/reclassify`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                ...item,
                sentiment: data.sentiment,
                sentimentScore: data.sentimentScore,
                feedbackThemes: data.feedbackThemes,
              }
              : item
          )
        );
        toast.success("AI reclassification completed");
      } else {
        const err = await res.json();
        toast.error(`Failed to reclassify: ${err.error || "Unknown error"}`);
      }
    } catch {
      toast.error("Network error running reclassification");
    } finally {
      setReclassifyingId(null);
    }
  };

  const getSentimentBadge = (sent: Sentiment) => {
    switch (sent) {
      case "POS":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded text-[10px] font-bold">POS</span>;
      case "NEG":
        return <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded text-[10px] font-bold">NEG</span>;
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded text-[10px] font-bold">NEU</span>;
    }
  };

  const getStatusBadgeColor = (stat: FeedbackStatus) => {
    switch (stat) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border border-blue-200/60";
      case "REVIEWED":
        return "bg-purple-50 text-purple-700 border border-purple-200/60";
      case "ACTIONED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200/60";
    }
  };

  const getThemeBadgeColor = (colorName: string | null) => {
    switch (colorName) {
      case "indigo":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200/60";
      case "purple":
        return "bg-purple-50 text-purple-700 border border-purple-200/60";
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
      case "red":
        return "bg-rose-50 text-rose-700 border border-rose-200/60";
      case "orange":
        return "bg-amber-50 text-amber-700 border border-amber-200/60";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200/60";
    }
  };

  const handleClearAllFilters = () => {
    setSearch("");
    setChannel("");
    setSentiment("");
    setStatusFilter("");
    setThemeId("");
    setPriority("");
    router.push("/dashboard/inbox");
  };

  const getPriorityBadge = (pri: Priority) => {
    switch (pri) {
      case "HIGH":
        return <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded text-[10px] font-bold">HIGH</span>;
      case "MEDIUM":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded text-[10px] font-bold">MEDIUM</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 border border-slate-200/60 px-2 py-0.5 rounded text-[10px] font-bold">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-card-custom border border-card-border shadow-sm space-y-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search feedback content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-card-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
            </span>
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            {/* Channel filter */}
            <select
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value);
                handleApplyFilters({ channel: e.target.value });
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

            {/* Sentiment filter */}
            <select
              value={sentiment}
              onChange={(e) => {
                setSentiment(e.target.value);
                handleApplyFilters({ sentiment: e.target.value });
              }}
              className="bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary min-w-[130px]"
            >
              <option value="">All Sentiments</option>
              <option value="POS">Positive</option>
              <option value="NEU">Neutral</option>
              <option value="NEG">Negative</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleApplyFilters({ status: e.target.value });
              }}
              className="bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary min-w-[130px]"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ACTIONED">Actioned</option>
            </select>

            {/* Theme filter */}
            <select
              value={themeId}
              onChange={(e) => {
                setThemeId(e.target.value);
                handleApplyFilters({ themeId: e.target.value });
              }}
              className="bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary min-w-[150px] max-w-[220px]"
            >
              <option value="">All Themes</option>
              {themes.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                handleApplyFilters({ priority: e.target.value });
              }}
              className="bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary min-w-[130px]"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="bg-card-custom border border-card-border hover:border-text-secondary text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export filtered feedback as CSV"
            >
              📥 Export CSV
            </button>

            {!isReadOnly && items.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear all workspace feedback history"
              >
                🗑️ Clear All Inbox
              </button>
            )}

            {/* Clear Filters */}
            {(search || channel || sentiment || statusFilter || themeId || priority) && (
              <button
                onClick={handleClearAllFilters}
                className="text-xs text-text-muted hover:text-text-secondary font-bold underline cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Floating Bar */}
      {selectedIds.length > 0 && !isReadOnly && (
        <div className="p-3.5 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-700 text-white font-extrabold px-2.5 py-0.5 rounded-full text-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold">messages marked for deletion</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteSelected}
              disabled={isBulkDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              {isBulkDeleting ? "Deleting..." : `🗑️ Delete Selected (${selectedIds.length})`}
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Table List Container */}
      <div className="bg-card-custom border border-card-border rounded-xl shadow-sm overflow-hidden">
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border bg-background/50 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {!isReadOnly && (
                    <th className="py-3 px-4 w-10 text-center select-none">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-card-border text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4 accent-indigo-600"
                        title="Select/Deselect All Visible Items"
                      />
                    </th>
                  )}
                  <th className="py-3 px-6 w-24">Sentiment</th>
                  <th className="py-3 px-6 w-24">Priority</th>
                  <th className="py-3 px-6">Feedback Content</th>
                  <th className="py-3 px-6 w-44">Channel / Customer</th>
                  <th className="py-3 px-6 w-48">Themes</th>
                  <th className="py-3 px-6 w-36">Status</th>
                  {!isReadOnly && <th className="py-3 px-6 w-20 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-sm text-text-secondary">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-background/30 transition-colors ${isSelected ? "bg-indigo-500/10 dark:bg-indigo-950/40" : ""
                        }`}
                    >
                      {!isReadOnly && (
                        <td className="py-4 px-4 text-center select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded border-card-border text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4 accent-indigo-600"
                          />
                        </td>
                      )}
                      {/* Sentiment Cell */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {getSentimentBadge(item.sentiment)}
                          <span className="text-[10px] text-text-muted font-bold text-center">
                            {item.sentimentScore > 0 ? "+" : ""}{item.sentimentScore.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Priority Cell */}
                      <td className="py-4 px-6">
                        {getPriorityBadge(item.priority)}
                      </td>

                      {/* Content Cell */}
                      <td className="py-4 px-6 font-normal text-text-primary leading-relaxed">
                        <p className="whitespace-pre-wrap max-w-xl">{item.content}</p>
                        <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-2">
                          <span>📅 {new Date(item.createdAt).toLocaleString()}</span>
                          {item.sourceRef && (
                            <span className="bg-background px-1.5 py-0.2 rounded border border-card-border text-[9px]">
                              Ref: {item.sourceRef}
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Channel & Customer Cell */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="inline-block text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {item.channel}
                          </span>
                          {item.customerLabel && (
                            <p className="text-xs text-text-muted truncate max-w-[150px]">
                              👤 {item.customerLabel}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Themes Cell */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {item.feedbackThemes.length > 0 ? (
                            item.feedbackThemes.map((ft) => (
                              <span
                                key={ft.theme.id}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded truncate ${getThemeBadgeColor(ft.theme.color)}`}
                                title={`${ft.theme.name} (${Math.round(ft.confidence * 100)}% confidence)`}
                              >
                                {ft.theme.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-text-muted italic">Unclassified</span>
                          )}
                        </div>
                      </td>

                      {/* Status Cell */}
                      <td className="py-4 px-6">
                        {isReadOnly ? (
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${getStatusBadgeColor(item.status)}`}>
                            {item.status}
                          </span>
                        ) : (
                          <div className="relative inline-block">
                            <select
                              disabled={updatingId === item.id || reclassifyingId === item.id}
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border outline-none bg-card-custom cursor-pointer disabled:opacity-50 transition-colors ${getStatusBadgeColor(item.status)}`}
                            >
                              <option value="NEW" className="bg-card-custom text-status-neu">New</option>
                              <option value="REVIEWED" className="bg-card-custom text-status-info">Reviewed</option>
                              <option value="ACTIONED" className="bg-card-custom text-status-pos">Actioned</option>
                            </select>
                            {updatingId === item.id && (
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 flex h-3.5 w-3.5 items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                              </span>
                            )}
                            {!isReadOnly && (
                              <button
                                disabled={updatingId === item.id || reclassifyingId === item.id}
                                onClick={() => handleReclassify(item.id)}
                                className="text-[10px] text-primary hover:text-primary-hover font-semibold block mt-1 hover:underline disabled:opacity-50 text-left cursor-pointer"
                              >
                                {reclassifyingId === item.id ? "Classifying..." : "⚡ Re-classify"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      {!isReadOnly && (
                        <td className="py-4 px-6 text-center">
                          <button
                            disabled={updatingId === item.id || reclassifyingId === item.id}
                            onClick={() => handleDeleteFeedback(item.id)}
                            className="text-text-muted hover:text-status-neg transition-colors p-1 cursor-pointer disabled:opacity-50"
                            title="Delete Feedback"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </span>
            <p className="text-sm font-semibold text-text-primary">No feedback items found</p>
            <p className="text-xs text-text-muted max-w-xs">
              Try adjusting your search criteria or filter dropdowns to find matching records.
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-card-border flex items-center justify-between bg-background/30 text-xs">
            <p className="text-text-muted">
              Showing <span className="font-semibold text-text-primary">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
              <span className="font-semibold text-text-primary">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-semibold text-text-primary">{pagination.total}</span> items
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="bg-card-custom border border-card-border text-text-primary px-3 py-1.5 rounded-lg hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="bg-card-custom border border-card-border text-text-primary px-3 py-1.5 rounded-lg hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear All Inbox Safety Modal Dialog */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card-custom border border-card-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-text-primary">Clear All Inbox History?</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                This action will permanently delete <strong>ALL feedback records</strong> from your active workspace inbox. This process cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="flex-1 bg-card-custom border border-card-border hover:border-text-secondary text-text-secondary font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllInbox}
                disabled={isPurging}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                {isPurging ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Clearing...
                  </>
                ) : (
                  "Yes, Delete All"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
