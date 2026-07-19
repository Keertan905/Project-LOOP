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
  
  // Invite form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.VIEWER);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Action loading states
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else if (res.status === 403) {
        // Redirect if forbidden
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
        const timer = setTimeout(() => {
          fetchMembers();
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [status, session, router, fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Successfully added ${name}!`);
        setName("");
        setEmail("");
        setPassword("");
        setRole(Role.VIEWER);
        // Refresh list
        fetchMembers();
      } else {
        setError(data.error || "Failed to add user");
      }
    } catch {
      setError("Network error adding user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setError("");
    setSuccess("");
    setUpdatingId(userId);

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
        );
        setSuccess("User role updated successfully!");
      } else {
        setError(data.error || "Failed to update role");
      }
    } catch {
      setError("Network error updating role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (userId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingId(userId);

    try {
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== userId));
        setSuccess(`Successfully removed ${memberName} from workspace.`);
      } else {
        setError(data.error || "Failed to remove user");
      }
    } catch {
      setError("Network error removing user");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent"></span>
          <p className="text-sm font-semibold">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Team Management
        </h1>
        <p className="text-slate-400 text-sm">
          Invite teammates, configure roles, and manage workspace permissions.
        </p>
      </div>

      {/* Message banners */}
      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-sm">
          ✅ {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left/Middle: Users List */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-lg font-bold text-slate-200">Active Workspace Members</h3>
            <p className="text-xs text-slate-500">Users who currently have access to this workspace</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {members.map((member) => {
                  const isSelf = member.id === session?.user.id;
                  return (
                    <tr key={member.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                            {member.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">
                              {member.name} {isSelf && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded ml-1.5 font-bold uppercase">You</span>}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Added {new Date(member.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{member.email}</td>
                      <td className="py-4 px-6">
                        {isSelf ? (
                          <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            {member.role}
                          </span>
                        ) : (
                          <select
                            disabled={updatingId === member.id}
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-bold uppercase cursor-pointer disabled:opacity-50"
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="ANALYST">Analyst</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!isSelf && (
                          <button
                            disabled={updatingId === member.id}
                            onClick={() => handleRemove(member.id, member.name)}
                            className="text-xs text-red-500 hover:text-red-400 hover:underline font-semibold disabled:opacity-50"
                          >
                            Remove
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

        {/* Right: Invite Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Add Team Member</h3>
            <p className="text-xs text-slate-500">Create a user directly linked to this workspace</p>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">Temporary Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">Workspace Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 uppercase font-semibold"
              >
                <option value="VIEWER">Viewer (Read-only)</option>
                <option value="ANALYST">Analyst (Triage & Reports)</option>
                <option value="ADMIN">Admin (Full Access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? "Adding Member..." : "Add Member"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
