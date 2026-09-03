"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, User, Copy, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

interface WorkspaceInfo {
  id: string;
  name: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  actorName: string;
  details: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"preferences" | "activity">("preferences");
  
  // Activity logs states
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [themeMode, setThemeMode] = useState<"system" | "light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "system" | "light" | "dark") || "system";
    }
    return "system";
  });

  const handleThemeChange = (mode: "system" | "light" | "dark") => {
    setThemeMode(mode);
    if (mode === "system") {
      localStorage.removeItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast.success(`Theme preference updated to ${mode === "system" ? "System Default" : mode === "dark" ? "Dark Mode" : "Light Mode"}`);
  };

  const fetchLogs = () => {
    setLoadingLogs(true);
    fetch("/api/activity")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load activity logs");
      })
      .then((data) => {
        setLogs(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error loading activity logs");
      })
      .finally(() => {
        setLoadingLogs(false);
      });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/workspace")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to load workspace info");
        })
        .then((data) => {
          setWorkspace(data);
          setName(data.name);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error loading workspace settings");
        })
        .finally(() => {
          setLoading(false);
        });

      if (session.user.role === "ADMIN") {
        fetchLogs();
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Workspace name cannot be empty");
      return;
    }

    setSaving(true);
    const promise = fetch("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    }).then(async (res) => {
      if (res.ok) {
        const updated = await res.json();
        setWorkspace(updated);
        setName(updated.name);
        // Refresh logs to show this rename operation
        fetchLogs();
        router.refresh();
        return updated;
      }
      const err = await res.json();
      throw new Error(err.error || "Failed to update workspace");
    });

    toast.promise(promise, {
      loading: "Saving workspace changes...",
      success: "Workspace settings updated successfully!",
      error: (err) => err.message || "Failed to save settings",
    });

    try {
      await promise;
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-text-secondary">Loading settings...</span>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user.role === "ADMIN";

  return (
    <main className="p-8 space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings & Preferences
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
          Manage your interface preferences and organizational workspace details.
        </p>
      </div>

      {/* Tab Switcher */}
      {isAdmin && (
        <div className="flex border-b border-card-border mb-6">
          <button
            onClick={() => setActiveSubTab("preferences")}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === "preferences"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveSubTab("activity")}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            Activity Audit Log
          </button>
        </div>
      )}

      {activeSubTab === "preferences" ? (
        <div className="space-y-6">
          {/* App Theme Preferences Card */}
          <div className="bg-card-custom border border-card-border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary">App Theme Preferences</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Choose whether LOOP should render in light mode, dark mode, or follow your operating system preferences automatically.
              </p>
            </div>

            <div className="max-w-lg">
              <label className="block mb-1.5 text-xs text-text-secondary font-bold uppercase tracking-wider">
                Active Theme Mode
              </label>
              <select
                value={themeMode}
                onChange={(e) => handleThemeChange(e.target.value as "system" | "light" | "dark")}
                className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold cursor-pointer"
              >
                <option value="system">💻 System Default</option>
                <option value="light">☀️ Light Mode</option>
                <option value="dark">🌙 Dark Mode</option>
              </select>
            </div>
          </div>

          {/* Workspace Profile Settings Card (ADMIN ONLY) */}
          {isAdmin && (
            <div className="bg-card-custom border border-card-border rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Workspace Profile</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  This name will be displayed globally across the sidebar and header layouts.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block mb-1.5 text-xs text-text-secondary font-bold uppercase tracking-wider">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-background border border-card-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                    {saving ? "Saving Changes..." : "Save Workspace Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}



          {/* Info Card (Visible to ADMIN) */}
          {isAdmin && (
            <div className="bg-card-custom/50 border border-card-border rounded-xl p-6 text-xs text-text-muted flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-text-secondary shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.984l-.04.018-1.083-.984zm.682 3.085a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 111.06-1.06l1.06 1.06zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-1">
                <p className="font-semibold text-text-secondary">Workspace Metadata</p>
                <p>
                  **Workspace ID:** `{workspace?.id}`
                </p>
                <p>
                  **Registered on:** {workspace ? new Date(workspace.createdAt).toLocaleDateString(undefined, { dateStyle: "long" }) : "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Activity Audit Log Tab content */
        <div className="bg-card-custom border border-card-border rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Workspace Activity Audit Log</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Review history logs of changes, submissions, and workspace events.
            </p>
          </div>

          {loadingLogs ? (
            <div className="flex flex-col items-center py-10 gap-2.5">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs text-text-muted">Loading audit history...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-xs text-text-muted">
              📭 No workspace actions logged yet.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative">
                  {/* Timeline dot icon indicator */}
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-1.5 text-xs font-semibold text-text-primary">
                      {log.details}
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-[10px] text-text-muted">
                      <User className="w-3.5 h-3.5" />
                      <span>Triggered by: <strong>{log.actorName}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
