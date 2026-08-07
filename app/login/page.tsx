"use client";

import { signIn, signOut, getSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleQuickAdminFill = () => {
    setValue("email", "admin@loop.com");
    setValue("password", "Password123");
    setLoginError("");
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoginError("");

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setLoginError("Invalid email or password");
      return;
    }

    // Verify session and role if Admin mode is active
    if (isAdminMode) {
      const session = await getSession();
      if (session?.user?.role !== "ADMIN") {
        await signOut({ redirect: false });
        setLoginError("Access Denied: This account does not have Administrator privileges.");
        return;
      }
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 transition-colors duration-200">
      <div className="w-full max-w-md rounded-xl bg-card-custom border border-card-border p-8 shadow-sm">
        
        {/* Mode Switcher Tabs */}
        <div className="flex bg-background p-1 rounded-lg border border-card-border mb-6">
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(false);
              setLoginError("");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              !isAdminMode
                ? "bg-card-custom text-text-primary shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(true);
              setLoginError("");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isAdminMode
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Login
          </button>
        </div>

        {/* Portal Header */}
        <div className="text-center mb-6">
          {isAdminMode ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Admin Authorization Mode
            </div>
          ) : null}

          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            {isAdminMode ? "Admin Portal" : "Welcome Back"}
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            {isAdminMode
              ? "Sign in with your workspace administrator credentials"
              : "Login to your Project LOOP account"}
          </p>
        </div>

        {/* Error Alert */}
        {loginError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
            ⚠️ {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-text-secondary font-bold uppercase tracking-wider">
              {isAdminMode ? "Admin Email Address" : "Email Address"}
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder={isAdminMode ? "admin@loop.com" : "you@company.com"}
              className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.email?.message && (
              <p className="text-xs text-status-neg mt-1 font-semibold">
                {errors.email?.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-secondary font-bold uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.password?.message && (
              <p className="text-xs text-status-neg mt-1 font-semibold">
                {errors.password?.message}
              </p>
            )}
          </div>

          {/* Quick Fill Preset for Admin */}
          {isAdminMode && (
            <button
              type="button"
              onClick={handleQuickAdminFill}
              className="w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline py-1 flex items-center justify-center gap-1"
            >
              ⚡ Quick Fill Admin Credentials (admin@loop.com)
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-lg py-2.5 text-white font-bold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm ${
              isAdminMode
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-primary hover:bg-primary-hover"
            }`}
          >
            {isSubmitting
              ? "Authenticating..."
              : isAdminMode
              ? "Sign In as Administrator"
              : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}