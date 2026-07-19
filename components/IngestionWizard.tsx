"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IngestionWizard() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"single" | "csv" | "simulated">("single");

  // Single feedback states
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("Support ticket");
  const [customerLabel, setCustomerLabel] = useState("");
  const [submittingSingle, setSubmittingSingle] = useState(false);

  // CSV states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsingError, setParsingError] = useState("");
  const [csvStats, setCsvStats] = useState<{
    total: number;
    imported: number;
    failed: number;
    logs: string[];
  } | null>(null);
  const [importingCsv, setImportingCsv] = useState(false);

  // Simulated integration states
  const [simulating, setSimulating] = useState(false);

  // Notification banners
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !channel) {
      showBanner("error", "Please fill in all required fields.");
      return;
    }

    setSubmittingSingle(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          channel,
          customerLabel: customerLabel.trim() || undefined,
        }),
      });

      if (res.ok) {
        showBanner("success", "Feedback entry created successfully!");
        setContent("");
        setCustomerLabel("");
        router.refresh();
      } else {
        const err = await res.json();
        showBanner("error", err.error || "Failed to submit feedback.");
      }
    } catch {
      showBanner("error", "Network error submitting feedback.");
    } finally {
      setSubmittingSingle(false);
    }
  };

  // Self-contained CSV Row Parser
  const parseCSVRow = (text: string) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map((s) => s.replace(/^["']|["']$/g, ""));
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length === 0) throw new Error("CSV file is empty.");

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

    const contentIdx = headers.indexOf("content");
    const channelIdx = headers.indexOf("channel");
    const customerLabelIdx = headers.indexOf("customer_label") !== -1 
      ? headers.indexOf("customer_label") 
      : headers.indexOf("customerlabel");
    const createdAtIdx = headers.indexOf("created_at") !== -1 
      ? headers.indexOf("created_at") 
      : headers.indexOf("createdat");

    if (contentIdx === -1 || channelIdx === -1) {
      throw new Error('CSV must contain at least "content" and "channel" columns.');
    }

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVRow(lines[i]);
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;
      
      items.push({
        content: row[contentIdx] || "",
        channel: row[channelIdx] || "",
        customerLabel: customerLabelIdx !== -1 ? row[customerLabelIdx] || null : null,
        createdAt: createdAtIdx !== -1 ? row[createdAtIdx] || null : null,
      });
    }

    return items;
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    setParsingError("");
    setCsvStats(null);
    setImportingCsv(true);

    try {
      const text = await csvFile.text();
      const parsedItems = parseCSV(text);

      if (parsedItems.length === 0) {
        throw new Error("No valid rows found in CSV.");
      }

      const res = await fetch("/api/feedback/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsedItems }),
      });

      const result = await res.json();

      if (res.ok) {
        setCsvStats({
          total: parsedItems.length,
          imported: result.importedCount,
          failed: result.failedCount,
          logs: result.errors,
        });
        if (result.failedCount === 0) {
          showBanner("success", `Successfully imported all ${result.importedCount} rows!`);
        } else {
          showBanner("error", `Import completed with ${result.failedCount} failures.`);
        }
        router.refresh();
      } else {
        setParsingError(result.error || "Failed to process import on server.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to parse CSV file.";
      setParsingError(message);
    } finally {
      setImportingCsv(false);
    }
  };

  const handleTriggerSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch("/api/feedback/ingest-simulated", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        showBanner("success", data.message || "Simulated feedback ingested successfully!");
        router.refresh();
      } else {
        showBanner("error", data.error || "Failed to trigger simulation.");
      }
    } catch {
      showBanner("error", "Network error running simulated ingestion.");
    } finally {
      setSimulating(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = 
`content,channel,customer_label,created_at
"Onboarding took forever — I couldn't figure out how to invite my team.","Support ticket","Mark Zuckerberg","2026-07-15T10:00:00Z"
"The app is super snappy today! Noticeable improvement.","Community post","Elon Musk","2026-07-16T14:30:00Z"
"It does the job, but the mobile experience needs work.","NPS survey","Bill Gates","2026-07-17T09:15:00Z"`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "loop_feedback_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner */}
      {banner && (
        <div
          className={`p-4 rounded-lg border text-sm font-semibold transition-all ${
            banner.type === "success"
              ? "bg-status-pos/10 border-status-pos/20 text-status-pos"
              : "bg-status-neg/10 border-status-neg/20 text-status-neg"
          }`}
        >
          {banner.type === "success" ? "✅" : "⚠️"} {banner.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-card-border">
        <button
          onClick={() => {
            setActiveTab("single");
            setCsvStats(null);
            setParsingError("");
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "single"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-text-secondary"
          }`}
        >
          Single Entry
        </button>
        <button
          onClick={() => {
            setActiveTab("csv");
            setCsvStats(null);
            setParsingError("");
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "csv"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-text-secondary"
          }`}
        >
          CSV Bulk Upload
        </button>
        <button
          onClick={() => {
            setActiveTab("simulated");
            setCsvStats(null);
            setParsingError("");
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "simulated"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-text-secondary"
          }`}
        >
          Simulated Integrations
        </button>
      </div>

      {/* Single Ingest Form */}
      {activeTab === "single" && (
        <div className="bg-card-custom border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-2">Ingest Single Feedback Record</h3>
          <p className="text-xs text-text-muted mb-6">Manually type a piece of user feedback from any channel</p>

          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs text-text-secondary font-bold uppercase tracking-wider">Feedback Content *</label>
              <textarea
                required
                rows={4}
                placeholder="What did the customer say? Enter user reviews, NPS comments, or support transcript..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs text-text-secondary font-bold uppercase tracking-wider">Feedback Channel *</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary font-medium"
                >
                  <option value="Support ticket">Support ticket</option>
                  <option value="App store review">App store review</option>
                  <option value="NPS survey">NPS survey</option>
                  <option value="Sales call note">Sales call note</option>
                  <option value="Community post">Community post</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-xs text-text-secondary font-bold uppercase tracking-wider">Customer Identifier (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe, customer-123"
                  value={customerLabel}
                  onChange={(e) => setCustomerLabel(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingSingle}
              className="bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submittingSingle ? "Ingesting..." : "Ingest Feedback"}
            </button>
          </form>
        </div>
      )}

      {/* CSV Bulk Ingest Form */}
      {activeTab === "csv" && (
        <div className="space-y-6">
          <div className="bg-card-custom border border-card-border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-text-primary">CSV Bulk Upload</h3>
                <p className="text-xs text-text-muted">Upload a spreadsheet (.csv) containing feedback records to ingest them in bulk</p>
              </div>
              <button
                onClick={handleDownloadSample}
                className="text-xs text-primary hover:text-primary-hover font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                📥 Download template.csv
              </button>
            </div>

            <div className="p-8 border-2 border-dashed border-card-border rounded-lg flex flex-col items-center justify-center bg-background/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-text-muted mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>

              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
              />

              <label
                htmlFor="csv-file-input"
                className="bg-card-custom hover:bg-background border border-card-border text-text-secondary font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                {csvFile ? "Change CSV File" : "Select CSV File"}
              </label>

              {csvFile && (
                <p className="text-xs text-text-secondary mt-2 font-semibold">
                  📎 Selected: <span className="text-text-primary">{csvFile.name}</span> ({Math.round(csvFile.size / 1024)} KB)
                </p>
              )}
            </div>

            {parsingError && (
              <div className="p-4 rounded-lg bg-status-neg/10 border border-status-neg/20 text-status-neg text-xs">
                ❌ {parsingError}
              </div>
            )}

            <button
              onClick={handleCsvImport}
              disabled={!csvFile || importingCsv}
              className="bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {importingCsv ? "Processing Bulk Import..." : "Import Feedback Data"}
            </button>
          </div>

          {/* Upload stats logs */}
          {csvStats && (
            <div className="bg-card-custom border border-card-border rounded-xl p-6 shadow-sm space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-text-primary">Import Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background p-4 rounded-lg text-center border border-card-border">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Total Rows</p>
                  <p className="text-2xl font-extrabold text-text-primary mt-1">{csvStats.total}</p>
                </div>
                <div className="bg-background p-4 rounded-lg text-center border border-card-border">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Successfully Imported</p>
                  <p className="text-2xl font-extrabold text-status-pos mt-1">{csvStats.imported}</p>
                </div>
                <div className="bg-background p-4 rounded-lg text-center border border-card-border">
                  <p className="text-[10px] text-text-muted uppercase font-bold">Failed Rows</p>
                  <p className={`text-2xl font-extrabold mt-1 ${csvStats.failed > 0 ? "text-status-neg" : "text-text-primary"}`}>
                    {csvStats.failed}
                  </p>
                </div>
              </div>

              {csvStats.logs.length > 0 && (
                <div className="space-y-1.5 animate-fade-in">
                  <p className="text-xs font-semibold text-text-secondary">Error Log details:</p>
                  <div className="max-h-40 overflow-y-auto p-3 bg-background border border-card-border rounded-lg text-xs font-mono text-status-neg space-y-1">
                    {csvStats.logs.map((log, i) => (
                      <p key={i}>{log}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Simulated Integration */}
      {activeTab === "simulated" && (
        <div className="bg-card-custom border border-card-border rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Simulate Channel Integrations</h3>
            <p className="text-xs text-text-muted">Simulate real-time feedback ingestion from active third-party channels (Zendesk, App Store, Twitter feeds)</p>
          </div>

          <div className="p-6 rounded-lg bg-background border border-card-border flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-sm font-bold text-text-secondary">Simulated Feed Sync</h4>
              <p className="text-xs text-text-muted">Triggers an automatic import of 10 mock feedback items from support tickets, Slack forums, app store feeds, and call notes.</p>
            </div>

            <button
              onClick={handleTriggerSimulation}
              disabled={simulating}
              className="bg-primary hover:bg-primary-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {simulating ? "Syncing..." : "Sync Simulated Channels"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
