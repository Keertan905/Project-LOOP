"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
  permission?: string;
}

interface SidebarNavProps {
  links: SidebarLink[];
  isCollapsed?: boolean;
}

export default function SidebarNav({ links, isCollapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  // Group links by section
  const sections: { title?: string; items: SidebarLink[] }[] = [];
  let currentSection: { title?: string; items: SidebarLink[] } = { items: [] };

  links.forEach((link) => {
    if (link.section !== currentSection.title) {
      if (currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: link.section, items: [link] };
    } else {
      currentSection.items.push(link);
    }
  });
  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return (
    <nav className={`p-3 space-y-4 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
      {sections.map((sec, idx) => (
        <div key={idx} className="space-y-1">
          {sec.title && !isCollapsed && (
            <h4 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              {sec.title}
            </h4>
          )}
          {sec.items.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                className={`flex items-center gap-3 rounded-xl text-xs font-semibold transition-all duration-150 w-full ${
                  isCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-indigo-600/90 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span className={`shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}>
                  {link.icon}
                </span>
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
