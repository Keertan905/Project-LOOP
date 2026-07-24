"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WorkspaceInfo {
  id: string;
  name: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        setTimeout(() => setLoading(false), 0);
        return;
      }

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
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Settings & Preferences
        </h1>
        <p className="text-text-secondary text-sm">
          Manage your interface theme and organizational workspace details.
        </p>
      </div>

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
    </main>
  );
}
