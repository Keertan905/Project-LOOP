import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import SidebarNav from "@/components/SidebarNav";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  permission?: "write:feedback" | "manage:users";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch workspace details
  const workspace = await prisma.workspace.findUnique({
    where: { id: session.user.workspaceId },
  });

  const links: SidebarLink[] = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      href: "/dashboard/inbox",
      label: "Feedback Inbox",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m-6.375 3h15a2.25 2.25 0 0 0 2.25-2.25V9A2.25 2.25 0 0 0 18 6.75h-1.125a3.375 3.375 0 0 0-6.75 0H9A2.25 2.25 0 0 0 6.75 9v9.75A2.25 2.25 0 0 0 9 21Z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/ingest",
      label: "Ingest Feedback",
      permission: "write:feedback",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/trends",
      label: "Theme Trends",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/ask",
      label: "Ask LOOP AI",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l3.593-1.606a9 9 0 0 0 8.163-12.871M12 3c3.812 0 7.02 2.424 8.162 5.794a9.07 9.07 0 0 1-5.904 12.113L12 21M9.813 15.904a8.966 8.966 0 0 1-2.3-5.385m2.3 5.385a9.07 9.07 0 0 1-2.022-2.113m0 0a9 9 0 0 1 12.113-5.904m-12.113 5.904A8.966 8.966 0 0 1 3 12c0-2.3.86-4.395 2.29-6.002" />
        </svg>
      ),
    },
    {
      href: "/dashboard/reports",
      label: "AI Reports",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/members",
      label: "Team Members",
      permission: "manage:users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
  ];

  // Filter links based on user role permissions
  const filteredLinks = links.filter((link) => {
    if (!link.permission) return true;
    return hasPermission(session.user.role, link.permission);
  });

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "ANALYST":
        return "bg-primary/10 text-primary border border-primary/20";
      default:
        return "bg-slate-500/10 text-sidebar-text-muted border border-slate-500/20";
    }
  };

  return (
    <div className="flex h-screen bg-background text-text-primary font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-custom border-r border-sidebar-border flex flex-col justify-between shrink-0 print:hidden">
        <div>
          {/* Header */}
          <div className="h-16 px-6 border-b border-sidebar-border flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-ai-accent bg-clip-text text-transparent">
              🔁 LOOP
            </span>
            <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sidebar-border/50 border border-sidebar-border text-sidebar-text-muted max-w-[120px] truncate">
              {workspace?.name || "Workspace"}
            </div>
          </div>

          {/* Navigation Links */}
          <SidebarNav links={filteredLinks} />
        </div>

        {/* Footer User Card */}
        <div className="p-4 border-t border-sidebar-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-sidebar-text shrink-0">
              {session.user.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-sidebar-text">
                {session.user.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.2 rounded uppercase ${getRoleBadgeStyles(session.user.role)}`}>
                  {session.user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 pt-2">
            <span className="text-[11px] text-sidebar-text-muted truncate max-w-[130px]">
              {session.user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background print:overflow-visible print:bg-white print:text-black">
        {children}
      </div>
    </div>
  );
}
