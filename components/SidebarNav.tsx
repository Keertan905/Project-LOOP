"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarNavProps {
  links: SidebarLink[];
}

export default function SidebarNav({ links }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1.5">
      {links.map((link) => {
        // Exact match for Overview dashboard, starts-with match for other nested sections
        const isActive =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-primary/10 text-primary border-l-4 border-primary rounded-l-none pl-2"
                : "text-sidebar-text-muted hover:text-sidebar-text hover:bg-sidebar-border/30"
            }`}
          >
            <span className={isActive ? "text-primary" : "text-sidebar-text-muted"}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
