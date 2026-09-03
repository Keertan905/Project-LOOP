"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Copy, ExternalLink, Share2 } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";
import LogoutButton from "@/components/LogoutButton";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
  permission?: string;
}

interface DashboardShellProps {
  workspaceId: string;
  workspaceName: string;
  userName?: string | null;
  userRole: string;
  userEmail?: string | null;
  filteredLinks: SidebarLink[];
  children: React.ReactNode;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

export default function DashboardShell({
  workspaceId,
  workspaceName,
  userName,
  userRole,
  userEmail,
  filteredLinks,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "CSV Feedback Ingested",
      desc: "5 new feedback records imported from CSV upload.",
      time: "2 mins ago",
      unread: true,
    },
    {
      id: "2",
      title: "New Team Member Joined",
      desc: "ansh accepted workspace invite as VIEWER.",
      time: "10 mins ago",
      unread: true,
    },
    {
      id: "3",
      title: "Weekly VoC Digest Ready",
      desc: "AI report generated for the last 7 days.",
      time: "1 hour ago",
      unread: false,
    },
  ]);

  // Profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Keyboard shortcut '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar-collapsed", String(nextState));
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "ANALYST":
        return "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
      default:
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Search Results filtering
  const searchablePages = [
    { label: "Dashboard Overview", href: "/dashboard", cat: "Page" },
    { label: "Feedback Inbox", href: "/dashboard/inbox", cat: "Page" },
    { label: "Import Data / Ingest", href: "/dashboard/ingest", cat: "Action" },
    { label: "AI Assistant (Ask LOOP)", href: "/dashboard/ask", cat: "AI Tool" },
    { label: "Theme Clusters & Trends", href: "/dashboard/trends", cat: "Analytics" },
    { label: "VoC Digest Reports", href: "/dashboard/reports", cat: "Reports" },
    { label: "Team Directory & Invites", href: "/dashboard/members", cat: "Workspace" },
    { label: "Workspace Settings", href: "/dashboard/settings", cat: "Workspace" },
  ];

  const filteredSearchResults = searchQuery.trim()
    ? searchablePages.filter((p) =>
        p.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchablePages.slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/inbox?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const getBreadcrumbTitle = () => {
    if (pathname.includes("/inbox")) return "Feedback Inbox";
    if (pathname.includes("/ingest")) return "Import Data";
    if (pathname.includes("/ask")) return "AI Assistant";
    if (pathname.includes("/trends")) return "Theme Clusters";
    if (pathname.includes("/reports")) return "VoC Reports";
    if (pathname.includes("/members")) return "Team Directory";
    if (pathname.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Dark Sidebar */}
      <aside 
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 transition-all duration-300 print:hidden overflow-hidden text-slate-200`}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-slate-800/80 flex items-center justify-center overflow-hidden shrink-0">
            {!isCollapsed ? (
              <div className="w-full px-4 flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent truncate shrink-0">
                    🔁 LOOP
                  </span>
                  <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 truncate max-w-[120px]">
                    {workspaceName}
                  </div>
                </div>
                
                {/* Toggle Button */}
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Collapse Sidebar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 animate-fade-in"
                title="Expand Sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 rotate-180">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <SidebarNav links={filteredLinks} isCollapsed={isCollapsed} />

          {/* Shareable Public Feedback Link Widget in Left Sidebar */}
          {workspaceId && (
            !isCollapsed ? (
              <div className="mx-3 my-2 p-3 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/20 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Share2 className="w-3 h-3 text-indigo-400" />
                    Public Feedback Form
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Collect client feedback directly without account creation.
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/f/${workspaceId}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Public feedback link copied to clipboard!");
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Link</span>
                  </button>
                  <a
                    href={`/f/${workspaceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                    title="Open Public Form in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-2 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/f/${workspaceId}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Public feedback link copied to clipboard!");
                  }}
                  className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition-all cursor-pointer"
                  title="Copy Public Feedback Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            )
          )}
        </div>

        {/* Footer User Card */}
        <div className="p-3 border-t border-slate-800/80 space-y-3 overflow-hidden">
          <div className="flex items-center gap-2.5 justify-center">
            <div 
              className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md cursor-pointer hover:opacity-90 transition-opacity" 
              onClick={() => setShowProfileMenu((prev) => !prev)}
              title={userName || "User Profile"}
            >
              {userName ? userName[0].toUpperCase() : "U"}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 animate-fade-in cursor-pointer" onClick={() => setShowProfileMenu((prev) => !prev)}>
                <p className="text-xs font-semibold truncate text-slate-200">
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
            <div className="flex justify-between items-center gap-1 pt-2 border-t border-slate-800/50 animate-fade-in">
              <span className="text-[10px] text-slate-500 truncate max-w-[125px]" title={userEmail || ""}>
                {userEmail}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex justify-center pt-2 border-t border-slate-800/50">
              <LogoutButton hideText={true} />
            </div>
          )}
        </div>
      </aside>

      {/* Light Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 text-slate-900 print:overflow-visible print:bg-white print:text-black">
        {/* Light Top Header Bar */}
        <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-slate-400 font-normal">app.loop.ai</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">{getBreadcrumbTitle()}</span>
          </div>

          {/* Right Header Utilities: Interactive Search, Notifications, Avatar */}
          <div className="flex items-center gap-4">
            {/* 1. Global Search Input with Dropdown Overlay */}
            <div className="relative w-64 hidden md:block" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit}>
                <svg className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Global search (press '/' to focus)..."
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </form>

              {/* Search Results Dropdown Popover */}
              {isSearchOpen && (
                <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30 animate-fade-in">
                  <div className="p-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Navigation & Tools</span>
                    <span className="text-[9px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/60">Press ↵ to search inbox</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {filteredSearchResults.map((page, idx) => (
                      <Link
                        key={idx}
                        href={page.href}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="px-3 py-2.5 hover:bg-indigo-50/60 flex items-center justify-between transition-colors text-xs cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">⚡</span>
                          <span className="font-semibold text-slate-800 group-hover:text-indigo-600">{page.label}</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                          {page.cat}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Notification Bell Dropdown Popover */}
            <div className="relative" ref={notificationMenuRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer rounded-lg hover:bg-slate-100"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center border border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Card */}
              {showNotifications && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-30 animate-scale-in">
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-indigo-100 text-indigo-700 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 transition-colors ${
                          item.unread ? "bg-indigo-50/30" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>}
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Expanded Profile Logo & User Menu Popover */}
            <div className="relative" ref={profileMenuRef}>
              <div
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="w-8 h-8 rounded-full bg-indigo-600 font-bold text-xs text-white flex items-center justify-center shadow-xs cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 transition-all"
                title={userName || "User Profile"}
              >
                {userName ? userName.slice(0, 2).toUpperCase() : "CH"}
              </div>

              {/* Profile Expanded Popover Card */}
              {showProfileMenu && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 overflow-hidden z-30 space-y-4 animate-scale-in">
                  {/* User Profile Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 font-bold text-sm text-white flex items-center justify-center shadow-md shrink-0">
                      {userName ? userName.slice(0, 2).toUpperCase() : "CH"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {userName || "Alice Admin"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mb-1">
                        {userEmail || "admin@loop.com"}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.2 rounded uppercase ${getRoleBadgeStyles(userRole)}`}>
                          {userRole}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 px-1 py-0.2 rounded bg-slate-100 border border-slate-200 truncate max-w-[100px]">
                          {workspaceName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Shortcuts */}
                  <div className="space-y-1 text-xs font-semibold text-slate-700">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span className="text-slate-400">⚙️</span>
                      <span>Account & Workspace Settings</span>
                    </Link>

                    <Link
                      href="/dashboard/members"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span className="text-slate-400">👥</span>
                      <span>Team & Access Directory</span>
                    </Link>

                    <Link
                      href="/dashboard/ask"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span className="text-slate-400">🤖</span>
                      <span>Ask LOOP AI Assistant</span>
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-2 rounded-xl border border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
