"use client";

import React, { useState, useEffect } from "react";
import SidebarNav from "@/components/SidebarNav";
import LogoutButton from "@/components/LogoutButton";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

interface DashboardShellProps {
  workspaceName: string;
  userName?: string | null;
  userRole: string;
  userEmail?: string | null;
  filteredLinks: SidebarLink[];
  children: React.ReactNode;
}

export default function DashboardShell({
  workspaceName,
  userName,
  userRole,
  userEmail,
  filteredLinks,
  children,
}: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar-collapsed", String(nextState));
  };

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
      <aside 
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } bg-sidebar-custom border-r border-sidebar-border flex flex-col justify-between shrink-0 transition-all duration-300 print:hidden overflow-hidden`}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-sidebar-border flex items-center justify-center overflow-hidden shrink-0">
            {!isCollapsed ? (
              <div className="w-full px-4 flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-ai-accent bg-clip-text text-transparent truncate shrink-0">
                    🔁 LOOP
                  </span>
                  <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sidebar-border/50 border border-sidebar-border text-sidebar-text-muted truncate max-w-[120px]">
                    {workspaceName}
                  </div>
                </div>
                
                {/* Toggle Button (Expanded State) */}
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
                  title="Collapse Sidebar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Toggle Button (Collapsed State) - Centered, no logo */
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-100 text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0 animate-fade-in"
                title="Expand Sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 rotate-180"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <SidebarNav links={filteredLinks} isCollapsed={isCollapsed} />
        </div>

        {/* Footer User Card */}
        <div className="p-3 border-t border-sidebar-border space-y-3 overflow-hidden">
          <div className="flex items-center gap-2.5 justify-center">
            <div 
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs text-sidebar-text shrink-0" 
              title={userName || "User"}
            >
              {userName ? userName[0].toUpperCase() : "U"}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 animate-fade-in">
                <p className="text-xs font-semibold truncate text-sidebar-text">
                  {userName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.2 rounded uppercase ${getRoleBadgeStyles(userRole)}`}>
                    {userRole}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed ? (
            <div className="flex justify-between items-center gap-1 pt-2 border-t border-sidebar-border/30 animate-fade-in">
              <span className="text-[10px] text-sidebar-text-muted truncate max-w-[125px]" title={userEmail || ""}>
                {userEmail}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex justify-center pt-2 border-t border-sidebar-border/30">
              <LogoutButton hideText={true} />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background print:overflow-visible print:bg-white print:text-black">
        {children}
      </div>
    </div>
  );
}
