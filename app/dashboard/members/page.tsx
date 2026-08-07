"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export default function MembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Mode state: "DIRECT" (instant user creation) vs "INVITE" (token link)
  const [addMode, setAddMode] = useState<"DIRECT" | "INVITE">("DIRECT");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.VIEWER);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Invite Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Action loading states
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else if (res.status === 403) {
        router.push("/403");
      }
    } catch (_err) {
      console.error("Error loading team members:", _err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/403");
      } else {
        fetchMembers();
      }
    }
  }, [status, session, router, fetchMembers]);

  // Handle Direct Add Member (Admin directly creates User in DB)
  const handleDirectAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`Member ${name} (${email}) created successfully!`);
        setName("");
        setEmail("");
        setPassword("");
        setRole(Role.VIEWER);
        fetchMembers();
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch {
      setError("Network error creating user");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Send Invite Link
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setInviteUrl(data.inviteUrl);
        setShowInviteModal(true);
        setName("");
        setEmail("");
        setRole(Role.VIEWER);
      } else {
        setError(data.error || "Failed to create invitation");
      }
    } catch {
      setError("Network error creating invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setError("");
    setSuccessMsg("");
    setUpdatingId(userId);

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
        );
        setSuccessMsg("Role updated successfully");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update role");
      }
    } catch {
      setError("Network error updating role");
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Revoke / Delete Member
  const handleRevokeUser = async (userId: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${memberName}?`)) {
      return;
    }

    setError("");
    setSuccessMsg("");
    setUpdatingId(userId);

    try {
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== userId));
        setSuccessMsg(`Access for ${memberName} has been revoked.`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to revoke member access");
      }
    } catch {
      setError("Network error revoking member access");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent"></span>
          <p className="text-sm font-semibold">Loading Team Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8 space-y-6 relative">
      {/* Top Banner Header */}
      <div className="space-y-1 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Team & Access Management</h1>
        <p className="text-xs text-slate-500 font-medium">Configure teammate roles and workspace accessibility permissions.</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          ✓ {successMsg}
        </div>
      )}

      {/* Main Grid: Left Add/Invite Form + Right Workspace Member List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Card: ADD / INVITE TEAM MEMBER */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          
          {/* Mode Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAddMode("DIRECT");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                addMode === "DIRECT"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Direct Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAddMode("INVITE");
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                addMode === "INVITE"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Invite Link
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {addMode === "DIRECT" ? "Add New Member" : "Invite Team Member"}
          </div>

          <form onSubmit={addMode === "DIRECT" ? handleDirectAdd : handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Teammate Full Name</label>
              <input
                type="text"
                required
                placeholder="Ansh Jain"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="ansh@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {addMode === "DIRECT" && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Assign Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer font-medium"
              >
                <option value="VIEWER">VIEWER (Read-only)</option>
                <option value="ANALYST">ANALYST (Triage & Analytics)</option>
                <option value="ADMIN">ADMIN (Full Access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{addMode === "DIRECT" ? "+ Add Member Now" : "+ Send Workspace Invite"}</span>
            </button>
          </form>
        </div>

        {/* Right Table: WORKSPACE MEMBER LIST */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Workspace Member List ({members.length})
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {members.map((member) => {
                  const isSelf = member.id === session?.user.id;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                            {member.name ? member.name.slice(0, 2).toUpperCase() : "CH"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              {member.name}
                              {isSelf && (
                                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 py-0.2 rounded">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isSelf ? (
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">
                            {member.role}
                          </span>
                        ) : (
                          <select
                            disabled={updatingId === member.id}
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                            className="bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-slate-700 uppercase cursor-pointer"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {new Date(member.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => handleRevokeUser(member.id, member.name)}
                            disabled={updatingId === member.id}
                            className="text-[11px] text-slate-400 hover:text-red-600 transition-colors font-semibold cursor-pointer disabled:opacity-50"
                          >
                            Revoke Access
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Workspace Invitation Created Modal Overlay */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-in relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-lg font-bold">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-900">Workspace Invitation Created</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Development Mode is enabled. Email delivery is disabled.<br />
                Share the secure invitation link below manually.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secure URL</label>
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-indigo-600 font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer text-center"
              >
                {copied ? "Copied! ✓" : "Copy Invitation Link"}
              </button>
              <a
                href={inviteUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
              >
                <span>↗ Open Invitation</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

