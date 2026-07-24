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
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-primary text-white shadow-sm shadow-primary/25 font-semibold"
                : "text-text-muted hover:text-text-primary hover:bg-slate-100"
            }`}
          >
            <span className={`transition-colors ${isActive ? "text-white" : "text-text-muted group-hover:text-text-primary"}`}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
