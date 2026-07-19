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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
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
        // Refresh router context to update layout/sidebar titles if needed
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

  if (session?.user.role !== "ADMIN") {
    return (
      <main className="p-8 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="max-w-md w-full bg-card-custom border border-card-border rounded-xl p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto w-12 h-12 bg-status-neg/10 text-status-neg rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary">Access Denied</h2>
          <p className="text-sm text-text-secondary">
            Workspace settings can only be managed by **Admin** users. Please contact your administrator if you need to rename the company workspace.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer"
          >
            Go to Dashboard Overview
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Workspace Settings
        </h1>
        <p className="text-text-secondary text-sm">
          Manage your organization name and general configuration options.
        </p>
      </div>

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

      {/* Info Card */}
      <div className="bg-card-custom/50 border border-card-border rounded-xl p-6 text-xs text-text-muted flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary shrink-0 mt-0.5">
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
    </main>
  );
}
