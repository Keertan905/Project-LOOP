"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  hideText?: boolean;
}

export default function LogoutButton({ hideText = false }: LogoutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      title={hideText ? "Sign out" : undefined}
      className={`text-xs text-text-muted hover:text-status-neg transition-colors font-medium flex items-center cursor-pointer ${
        hideText ? "p-1.5 justify-center" : "gap-1.5"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
      </svg>
      {!hideText && <span>Sign out</span>}
    </button>
  );
}