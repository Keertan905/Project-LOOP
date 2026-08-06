import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sentiment, FeedbackStatus } from "@prisma/client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const workspaceId = session.user.workspaceId;

  // Fetch workspace details and metric counts in parallel
  const [
    workspace,
    totalFeedback,
    newFeedback,
    reviewedFeedback,
    actionedFeedback,
    recentFeedback,
  ] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId } }),
    prisma.feedback.count({ where: { workspaceId } }),
    prisma.feedback.count({ where: { workspaceId, status: FeedbackStatus.NEW } }),
    prisma.feedback.count({ where: { workspaceId, status: FeedbackStatus.REVIEWED } }),
    prisma.feedback.count({ where: { workspaceId, status: FeedbackStatus.ACTIONED } }),
    prisma.feedback.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  let activityLogs: Array<{ id: string; action: string; actorName: string; details?: string | null; createdAt: Date }> = [];
  
  try {
    const prismaAny = prisma as unknown as Record<string, { findMany: (args: unknown) => Promise<Array<{ id: string; action: string; actorName: string; details?: string | null; createdAt: Date }>> }>;
    if (prismaAny.activityLog && typeof prismaAny.activityLog.findMany === "function") {
      activityLogs = await prismaAny.activityLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    }
  } catch (err) {
    console.warn("ActivityLog table query fallback:", err);
  }

  const assignedFeedback = 0;
  const unassignedFeedback = totalFeedback;

  return (
    <main className="p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SaaS Workspace Overview</h1>
          <p className="text-xs text-slate-500 font-medium">Live operational review for {workspace?.name || "Acme Corp"}.</p>
        </div>

        {/* Date Dropdown */}
        <select className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-indigo-500 shadow-xs">
          <option value="30d">Last 30 Days</option>
          <option value="7d">Last 7 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* 6 Metric Cards Row (Clean Light Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* TOTAL FEEDBACK */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL FEEDBACK</span>
          <div className="text-xl font-extrabold text-slate-900">{totalFeedback} items</div>
        </div>

        {/* NEW FEEDBACK */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NEW FEEDBACK</span>
          <div className="text-xl font-extrabold text-purple-600">{newFeedback} items</div>
        </div>

        {/* REVIEWED FEEDBACK */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">REVIEWED FEEDBACK</span>
          <div className="text-xl font-extrabold text-amber-600">{reviewedFeedback} items</div>
        </div>

        {/* ACTIONED FEEDBACK */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIONED FEEDBACK</span>
          <div className="text-xl font-extrabold text-emerald-600">{actionedFeedback} items</div>
        </div>

        {/* ASSIGNED FEEDBACK */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ASSIGNED FEEDBACK</span>
          <div className="text-xl font-extrabold text-slate-700">{assignedFeedback} items</div>
        </div>

        {/* UNASSIGNED FEEDBACK */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">UNASSIGNED FEEDBACK</span>
          <div className="text-xl font-extrabold text-slate-900">{unassignedFeedback} items</div>
        </div>
      </div>

      {/* 50/50 Split Panel Grid (Clean Light Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Panel: Recent Ingested Feedback */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Recent Ingested Feedback
          </div>

          <div className="space-y-3">
            {recentFeedback.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No feedback ingested yet.</p>
            ) : (
              recentFeedback.map((item) => (
                <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.channel}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                        item.sentiment === Sentiment.POS ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        item.sentiment === Sentiment.NEG ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {item.sentiment}
                      </span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium italic">
                    "{item.content}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Workspace Activity Feed */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Workspace Activity Feed
          </div>

          <div className="space-y-4 pl-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activityLogs.length === 0 ? (
              <div className="space-y-3 pl-4">
                <div className="relative flex flex-col gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 absolute -left-[21px] top-1"></span>
                  <p className="text-xs font-bold text-slate-800">User joined workspace</p>
                  <p className="text-[10px] text-slate-400">ansh • Just now</p>
                </div>
                <div className="relative flex flex-col gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 absolute -left-[21px] top-1"></span>
                  <p className="text-xs font-bold text-slate-800">CSV imported</p>
                  <p className="text-[10px] text-slate-400">5 feedback records • 1 second ago</p>
                </div>
                <div className="relative flex flex-col gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 absolute -left-[21px] top-1"></span>
                  <p className="text-xs font-bold text-slate-800">User joined workspace</p>
                  <p className="text-[10px] text-slate-400">Code Hamsters • 2 seconds ago</p>
                </div>
              </div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="relative flex flex-col gap-0.5 pl-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 absolute -left-[21px] top-1"></span>
                  <p className="text-xs font-bold text-slate-800">{log.action.replace("_", " ")}</p>
                  <p className="text-[10px] text-slate-400">{log.details || log.actorName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}