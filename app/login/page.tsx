"use client";

import { signIn, signOut, getSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Mail, 
  Lock, 
  CheckCircle2, 
  Crown, 
  Sparkles,
  ArrowRight,
  Shield,
  LogIn
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "ANALYST" | "VIEWER">("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleQuickFill = () => {
    if (selectedRole === "ADMIN") {
      setValue("email", "admin@loop.com");
      setValue("password", "Password123");
    } else if (selectedRole === "ANALYST") {
      setValue("email", "analyst@loop.com");
      setValue("password", "Password123");
    } else {
      setValue("email", "viewer@loop.com");
      setValue("password", "Password123");
    }
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

    const session = await getSession();
    const userRole = session?.user?.role;

    // Enforce role-based access based on choice
    if (selectedRole === "ADMIN" && userRole !== "ADMIN") {
      await signOut({ redirect: false });
      setLoginError("Access Denied: This account does not have Administrator privileges.");
      return;
    }
    
    if (selectedRole === "ANALYST" && userRole !== "ANALYST" && userRole !== "ADMIN") {
      await signOut({ redirect: false });
      setLoginError("Access Denied: This account does not have Analyst privileges.");
      return;
    }

    if (selectedRole === "VIEWER" && userRole !== "VIEWER" && userRole !== "ANALYST" && userRole !== "ADMIN") {
      await signOut({ redirect: false });
      setLoginError("Access Denied: This account does not have Viewer privileges.");
      return;
    }

    router.push("/dashboard");
  };

  // Step 0: Role Selection Interface
  if (step === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Soft Background Decorative Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl p-8 md:p-12 relative z-10">
          
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Choose your role to continue
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              LOOP adapts to your role and shows what matters.
            </p>
          </div>

          {/* Role Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Admin Card */}
            <div
              onClick={() => setSelectedRole("ADMIN")}
              className={`group cursor-pointer rounded-xl border p-5 flex flex-col items-center text-center transition-all duration-200 ${
                selectedRole === "ADMIN"
                  ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20 shadow-md"
                  : "border-slate-200 dark:border-slate-800 bg-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105 ${
                selectedRole === "ADMIN"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                <Crown className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">Admin</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                Manage platform users, settings, and workspaces.
              </p>
              
              {/* Radio Indicator */}
              <div className="mt-4 flex items-center justify-center">
                <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all ${
                  selectedRole === "ADMIN"
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300 dark:border-slate-600 bg-transparent"
                }`}>
                  {selectedRole === "ADMIN" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>

            {/* Analyst Card */}
            <div
              onClick={() => setSelectedRole("ANALYST")}
              className={`group cursor-pointer rounded-xl border p-5 flex flex-col items-center text-center transition-all duration-200 ${
                selectedRole === "ANALYST"
                  ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20 shadow-md"
                  : "border-slate-200 dark:border-slate-800 bg-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105 ${
                selectedRole === "ANALYST"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                <BarChart3 className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">Analyst</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                Analyze customer feedback and generate detailed reports.
              </p>
              
              {/* Radio Indicator */}
              <div className="mt-4 flex items-center justify-center">
                <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all ${
                  selectedRole === "ANALYST"
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300 dark:border-slate-600 bg-transparent"
                }`}>
                  {selectedRole === "ANALYST" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>

            {/* Viewer Card */}
            <div
              onClick={() => setSelectedRole("VIEWER")}
              className={`group cursor-pointer rounded-xl border p-5 flex flex-col items-center text-center transition-all duration-200 ${
                selectedRole === "VIEWER"
                  ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20 shadow-md"
                  : "border-slate-200 dark:border-slate-800 bg-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105 ${
                selectedRole === "VIEWER"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                <Eye className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">Viewer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-grow">
                View sentiment dashboards, inbox items, and execute Q&A.
              </p>
              
              {/* Radio Indicator */}
              <div className="mt-4 flex items-center justify-center">
                <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all ${
                  selectedRole === "VIEWER"
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300 dark:border-slate-600 bg-transparent"
                }`}>
                  {selectedRole === "VIEWER" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </div>

          {/* Continue Action */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-3 px-6 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Not sure? <a href="#" className="hover:underline font-medium text-slate-500 dark:text-slate-400">Contact administrator</a>
          </p>
        </div>
      </div>
    );
  }

  // Step 1: Split-Screen Login Form
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* LEFT PANEL: Role-Based Branding Showcase */}
      <div className={`relative hidden lg:flex flex-col justify-between p-12 overflow-hidden ${
        selectedRole === "ADMIN"
          ? "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white"
          : "bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 text-white"
      }`}>
        
        {/* Dynamic Abstract Grid/Wave Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-40 ${
          selectedRole === "ADMIN" ? "bg-cyan-500" : "bg-pink-500"
        }`} />

        {/* Brand Logo Header */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight uppercase">LOOP</span>
        </div>

        {/* Center Content Section */}
        <div className="my-auto relative z-10 max-w-md">
          {selectedRole === "ADMIN" ? (
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold mb-4">
                <Shield className="w-3.5 h-3.5" />
                Administrative Access
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                Admin Access
              </h2>
              <p className="mt-3 text-slate-300 leading-relaxed">
                Powerful workspace controls, tenant isolation, full team permission configurations, and direct DB analytics.
              </p>
              
              {/* Graphic Mockup (Admin) */}
              <div className="mt-8 p-5 bg-white/5 border border-white/10 backdrop-blur-lg rounded-xl shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 text-xs text-slate-300 font-mono">
                  <span>SYSTEM OVERVIEW</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    ONLINE
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/20 rounded-full w-3/4" />
                  <div className="h-2 bg-white/10 rounded-full w-1/2" />
                  <div className="h-2 bg-white/15 rounded-full w-5/6" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">ACTIVE SESSIONS: 142</span>
                  <div className="w-16 h-6 bg-cyan-500/20 border border-cyan-500/40 rounded flex items-center justify-center text-[10px] text-cyan-300 font-mono font-bold">
                    SECURE
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                Smarter Feedback.<br />Better Decisions.
              </h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200 text-sm">AI-Powered Insights for sentiment categorization</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200 text-sm">Actionable visual dashboards and compiling reports</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200 text-sm">Secure and dedicated Role-Based access levels</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200 text-sm">Cross-workspace intelligence dashboards</span>
                </div>
              </div>

              {/* Graphic Mockup (User/Analyst) */}
              <div className="mt-8 p-5 bg-white/5 border border-white/10 backdrop-blur-lg rounded-xl shadow-2xl">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex gap-4 items-end h-20">
                  <div className="bg-white/20 hover:bg-white/30 transition-all rounded-t w-full h-[40%]" />
                  <div className="bg-white/40 hover:bg-white/50 transition-all rounded-t w-full h-[85%]" />
                  <div className="bg-white/30 hover:bg-white/45 transition-all rounded-t w-full h-[60%]" />
                  <div className="bg-white/50 hover:bg-white/60 transition-all rounded-t w-full h-[95%]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info text */}
        <div className="relative z-10 text-xs text-slate-400 font-medium">
          Trusted by teams who care about customer voice.
        </div>
      </div>

      {/* RIGHT PANEL: Credentials Login Form */}
      <div className="flex flex-col justify-between p-6 md:p-12 lg:p-16 relative">
        
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setLoginError("");
            }}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Change Role
          </button>

          {/* Minimal badge displaying active role */}
          <span className="text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            {selectedRole} MODE
          </span>
        </div>

        {/* Form Container Card */}
        <div className="w-full max-w-md mx-auto my-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {selectedRole === "ADMIN" ? "Sign in to Admin Portal" : "Sign in to your account"}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter your credentials to continue
            </p>
          </div>

          {/* Validation/Session errors */}
          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold flex gap-2 items-start">
              <span className="text-base leading-none">⚠️</span>
              <p>{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Address Input */}
            <div>
              <label className="mb-1.5 block text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  {...register("email")}
                  placeholder={
                    selectedRole === "ADMIN"
                      ? "admin@loop.com"
                      : selectedRole === "ANALYST"
                      ? "analyst@loop.com"
                      : "viewer@loop.com"
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                />
              </div>
              {errors.email?.message && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-semibold">
                  {errors.email?.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-semibold">
                  {errors.password?.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-800"
                />
                Remember me
              </label>
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-xl py-3 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                selectedRole === "ADMIN"
                  ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/20"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* SSO Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800/80" />
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase">
              <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-400">OR</span>
            </div>
          </div>

          {/* Social Sign-in Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Credentials Sandbox Helper */}
          <div className="mt-6 p-4 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10 flex flex-col items-center">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
              🛠️ Sandbox Testing Mode
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              ⚡ Quick Fill {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} Credentials
            </button>
          </div>
        </div>

        {/* Lower footer row */}
        <div className="mt-8 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Sign Up
            </Link>
          </p>
          <Link href="/" className="hover:underline font-semibold">
            Back to homepage
          </Link>
        </div>

      </div>
    </div>
  );
}