"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/lib/permissions";

interface ReportListItem {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  generatedBy: {
    name: string;
  };
}

interface ReportDetails extends ReportListItem {
  contentJson: string;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDetails | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Generate form states
  const [showGenerator, setShowGenerator] = useState(false);
  const [title, setTitle] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState("");

  const isReadOnly = session ? !hasPermission(session.user.role, "write:reports") : true;

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        if (data.length > 0 && !selectedReportId) {
          setSelectedReportId(data[0].id);
        }
      }
    } catch (_err) {
      console.error("Error fetching reports list:", _err);
    } finally {
      setLoadingList(false);
    }
  }, [selectedReportId]);

  const fetchReportDetails = useCallback(async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data);
      }
    } catch (_err) {
      console.error("Error fetching report details:", _err);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const timer = setTimeout(() => {
        fetchReports();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [status, router, fetchReports]);

  useEffect(() => {
    if (selectedReportId) {
      const timer = setTimeout(() => {
        fetchReportDetails(selectedReportId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedReportId, fetchReportDetails]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setGenerating(true);

    try {
      // Validate dates
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      if (start >= end) {
        setFormError("Start date must be before end date.");
        setGenerating(false);
        return;
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          periodStart: start.toISOString(),
          periodEnd: end.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Prepend new report to list
        setReports((prev) => [data, ...prev]);
        setSelectedReportId(data.id);
        setShowGenerator(false);
        setTitle("");
        setPeriodStart("");
        setPeriodEnd("");
      } else {
        setFormError(data.error || "Failed to generate report");
      }
    } catch {
      setFormError("Network error sending generation request");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loadingList || status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-text-muted">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent"></span>
          <p className="text-sm font-semibold text-text-muted">Loading AI reports...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8 space-y-6 flex flex-col h-full print:p-0 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-card-border pb-5 shrink-0 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Voice of Customer Reports
          </h1>
          <p className="text-text-secondary text-sm">
            Generate Weekly/Monthly executive digests summarizing themes and actions.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowGenerator(true)}
            className="bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
            </svg>
            Generate Report
          </button>
        )}
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden min-h-[500px]">
        {/* Left Side: Reports List */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3 overflow-y-auto print:hidden">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Generated Reports</span>
          {reports.length > 0 ? (
            reports.map((report) => {
              const isActive = report.id === selectedReportId;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-card-custom border-primary text-text-primary shadow-sm"
                      : "bg-card-custom/50 border-card-border hover:bg-card-custom text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <h4 className="font-bold text-sm truncate">{report.title}</h4>
                  <p className="text-[10px] text-text-muted mt-1 font-semibold">
                    📅 {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-[9px] text-text-muted border-t border-card-border/60 pt-2">
                    <span>By {report.generatedBy.name}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-card-custom/40 border border-card-border rounded-xl text-xs text-text-muted italic">
              No reports compiled yet.
            </div>
          )}
        </div>

        {/* Right Side: Report Content Render */}
        <div className="flex-1 bg-card-custom border border-card-border rounded-xl overflow-hidden shadow-sm flex flex-col print:border-none print:shadow-none print:bg-white print:text-black">
          {selectedReport ? (
            <>
              {/* Report Header */}
              <div className="p-6 border-b border-card-border flex items-center justify-between shrink-0 print:border-none print:px-0">
                <div>
                  <h2 className="text-xl font-bold text-text-primary print:text-black print:text-3xl">{selectedReport.title}</h2>
                  <p className="text-xs text-text-muted mt-1 font-semibold print:text-slate-600">
                    Range: {new Date(selectedReport.periodStart).toLocaleDateString()} to {new Date(selectedReport.periodEnd).toLocaleDateString()} | Author: {selectedReport.generatedBy.name}
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 border border-card-border hover:border-text-secondary rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors bg-background print:hidden cursor-pointer"
                >
                  🖨️ Export PDF
                </button>
              </div>

              {/* Report Content */}
              <div className="flex-1 p-8 overflow-y-auto space-y-6 print:overflow-visible print:p-0">
                {loadingDetails ? (
                  <div className="h-full flex items-center justify-center text-text-muted">
                    <span className="animate-spin h-5 w-5 rounded-full border-2 border-primary border-t-transparent mr-2"></span>
                    Fetching report body...
                  </div>
                ) : (
                  <article className="prose max-w-none text-text-secondary space-y-4 print:text-black">
                    {/* Render raw markdown structure manually with clean styles */}
                    {selectedReport.contentJson.split("\n").map((line, idx) => {
                      if (line.startsWith("# ")) {
                        return <h1 key={idx} className="text-2xl font-extrabold text-text-primary mt-6 mb-2 border-b border-card-border pb-1.5 print:text-black">{line.replace("# ", "")}</h1>;
                      }
                      if (line.startsWith("## ")) {
                        return <h2 key={idx} className="text-lg font-bold text-ai-accent mt-6 mb-2 print:text-black">{line.replace("## ", "")}</h2>;
                      }
                      if (line.startsWith("### ")) {
                        return <h3 key={idx} className="text-sm font-semibold text-text-secondary mt-4 mb-2 print:text-black">{line.replace("### ", "")}</h3>;
                      }
                      if (line.startsWith("> ")) {
                        return (
                          <blockquote key={idx} className="border-l-4 border-ai-accent pl-4 py-1.5 italic bg-background/50 rounded my-3 text-text-secondary print:text-slate-700 print:bg-slate-100">
                            {line.replace("> ", "")}
                          </blockquote>
                        );
                      }
                      if (line.startsWith("- ")) {
                        return <li key={idx} className="ml-5 list-disc leading-relaxed my-1">{line.replace("- ", "")}</li>;
                      }
                      if (line.match(/^\d+\./)) {
                        return <li key={idx} className="ml-5 list-decimal leading-relaxed my-1">{line.replace(/^\d+\.\s*/, "")}</li>;
                      }
                      if (line.trim()) {
                        return <p key={idx} className="leading-relaxed whitespace-pre-line text-text-secondary">{line}</p>;
                      }
                      return <div key={idx} className="h-2"></div>;
                    })}
                  </article>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8 space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-text-muted/60">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p className="text-sm font-semibold text-text-primary">No report selected</p>
              <p className="text-xs text-text-muted">Select a report from the list on the left or generate a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal Dialogue */}
      {showGenerator && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-card-custom border border-card-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Generate VoC Report</h3>
              <p className="text-xs text-text-muted">Formulates a narrative document around feedback metrics for the given timeframe</p>
            </div>

            {formError && (
              <div className="p-3 rounded bg-status-neg/10 border border-status-neg/20 text-status-neg text-xs font-semibold">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs text-text-secondary font-bold uppercase tracking-wider">Report Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Feedback Insights Summary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary placeholder-text-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs text-text-secondary font-bold uppercase tracking-wider">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs text-text-secondary font-bold uppercase tracking-wider">End Date *</label>
                  <input
                    type="date"
                    required
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setShowGenerator(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-text-secondary hover:text-text-primary border border-card-border hover:bg-background transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {generating ? "Generating Digest..." : "Create Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
