"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Sparkles, 
  PlayCircle, 
  ArrowRight, 
  ChevronDown, 
  Brain, 
  MessageSquare, 
  BarChart3, 
  Lock, 
  Shield, 
  Eye, 
  Sun, 
  Moon 
} from "lucide-react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <main className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500/20 ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* 1. PREMIUM HEADER / NAVBAR */}
      <header className={`w-full sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200/80"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4.5 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight uppercase">LOOP</span>
            <span className="text-xs text-slate-400 font-medium ml-1.5 hidden sm:inline">Project LOOP</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it Works</a>
            <a href="#roles" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Roles</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
            <button className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer">
              Resources <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isDarkMode ? "border-slate-800 text-yellow-400 hover:bg-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth buttons */}
            <Link 
              href="/login"
              className={`hidden sm:inline-block px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                isDarkMode ? "border-slate-800 text-slate-300 hover:bg-slate-900" : "border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Log in
            </Link>

            <Link 
              href="/login"
              className="px-4.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (Split-Screen Design) */}
      <section className="relative overflow-hidden py-16 lg:py-24 max-w-7xl mx-auto px-6 w-full">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-5 flex flex-col items-start relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Driven Feedback Intelligence
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Close the Loop on <br/>
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Customer Feedback
              </span>
            </h1>

            <p className="mt-6 text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              Ingest, analyze, and cluster multi-channel customer feedback. AI turns noise into actionable insights—so you can make better decisions, faster.
            </p>

            {/* Quick Role Badges */}
            <div className="mt-8 grid grid-cols-3 gap-2.5 w-full max-w-md">
              <div className={`flex items-center gap-2 p-3.5 rounded-xl border text-left ${isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/60 shadow-xs"}`}>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Admin</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Manage everything</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 p-3.5 rounded-xl border text-left ${isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/60 shadow-xs"}`}>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Analyst</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Analyze & uncover</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 p-3.5 rounded-xl border text-left ${isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/60 shadow-xs"}`}>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Viewer</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">View & report</p>
                </div>
              </div>
            </div>

            {/* Main Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center gap-2 cursor-pointer group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <a
                href="#features"
                className={`px-6 py-3.5 rounded-xl border font-bold text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
                  isDarkMode 
                    ? "border-slate-800 hover:bg-slate-900 text-slate-300" 
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                }`}
              >
                <PlayCircle className="w-4 h-4 text-indigo-500" />
                Explore Features
              </a>
            </div>
          </div>

          {/* Right Column: Dashboard Preview Panel Mockup */}
          <div className="lg:col-span-7 flex justify-center relative">
            
            {/* Dashboard Backdrop Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-2xl blur-2xl opacity-60 -z-10" />

            {/* High-Fidelity Mockup Window */}
            <div className="w-full max-w-[640px] bg-slate-950 text-slate-300 rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col font-mono text-[11px]">
              
              {/* Window Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/90" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/90" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/90" />
                </div>
                <div className="px-3 py-1 bg-slate-950/80 rounded border border-slate-800/80 text-[10px] text-slate-500 font-mono tracking-tight select-none">
                  localhost:3000/dashboard
                </div>
                <div className="w-12" /> {/* spacer */}
              </div>

              {/* Window body containing dashboard layout */}
              <div className="flex h-[360px] relative overflow-hidden bg-slate-950">
                
                {/* 1. Sidebar Panel (Left) */}
                <div className="w-[130px] border-r border-slate-900 bg-slate-950/40 p-3 flex flex-col justify-between shrink-0 text-slate-400 select-none">
                  <div>
                    {/* Sidebar Brand Logo */}
                    <div className="flex items-center gap-1.5 mb-5 px-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-extrabold text-[11px] text-white tracking-wide">LOOP</span>
                    </div>

                    {/* Sidebar Navigation */}
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2 px-2 py-1.5 bg-slate-900 text-white rounded font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />Overview</li>
                      <li className="flex items-center gap-2 px-2 py-1.5 hover:text-white rounded"><div className="w-1.5 h-1.5 rounded-full bg-slate-800" />Inbox</li>
                      <li className="flex items-center gap-2 px-2 py-1.5 hover:text-white rounded"><div className="w-1.5 h-1.5 rounded-full bg-slate-800" />AI Assist</li>
                      <li className="flex items-center gap-2 px-2 py-1.5 hover:text-white rounded"><div className="w-1.5 h-1.5 rounded-full bg-slate-800" />Analytics</li>
                      <li className="flex items-center gap-2 px-2 py-1.5 hover:text-white rounded"><div className="w-1.5 h-1.5 rounded-full bg-slate-800" />Themes</li>
                      <li className="flex items-center gap-2 px-2 py-1.5 hover:text-white rounded"><div className="w-1.5 h-1.5 rounded-full bg-slate-800" />Settings</li>
                    </ul>
                  </div>

                  {/* Profile info in sidebar */}
                  <div className="border-t border-slate-900 pt-2.5 flex items-center gap-1.5 px-1 text-[10px]">
                    <div className="w-5.5 h-5.5 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white uppercase text-[8px] tracking-wide shrink-0">KR</div>
                    <div className="truncate">
                      <div className="text-white font-bold truncate leading-none">Keertan R.</div>
                      <div className="text-[8px] text-slate-400 font-medium truncate mt-0.5">Admin</div>
                    </div>
                  </div>
                </div>

                {/* 2. Main Dashboard Content (Right) */}
                <div className="flex-1 bg-slate-950 p-4 flex flex-col justify-between overflow-hidden">
                  
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-start mb-3 select-none">
                    <div>
                      <h3 className="text-white font-extrabold text-[12px]">Overview</h3>
                      <p className="text-[9px] text-slate-500 mt-0.5">Welcome back, Keertan! Here&apos;s what&apos;s happening.</p>
                    </div>
                    <span className="text-[8px] text-slate-500 bg-slate-900 border border-slate-800/80 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      Last 30 days
                    </span>
                  </div>

                  {/* Dashboard 4 Mini Metric Cards */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-slate-900/40 border border-slate-900 p-2 rounded">
                      <div className="text-[8px] text-slate-500 font-bold uppercase truncate">Feedback</div>
                      <div className="text-white font-extrabold text-[11px] mt-0.5">12,842</div>
                      {/* Mini sparkline */}
                      <svg className="w-full h-3 mt-1.5 stroke-indigo-500 stroke-[1.5] fill-none" viewBox="0 0 40 10">
                        <path d="M0,8 Q5,2 10,6 T20,4 T30,7 T40,2" />
                      </svg>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-900 p-2 rounded">
                      <div className="text-[8px] text-slate-500 font-bold uppercase truncate">AI Themes</div>
                      <div className="text-white font-extrabold text-[11px] mt-0.5">248</div>
                      {/* Mini sparkline */}
                      <svg className="w-full h-3 mt-1.5 stroke-indigo-500 stroke-[1.5] fill-none" viewBox="0 0 40 10">
                        <path d="M0,7 Q5,8 10,4 T20,6 T30,3 T40,5" />
                      </svg>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-900 p-2 rounded">
                      <div className="text-[8px] text-slate-500 font-bold uppercase truncate">Sentiment</div>
                      <div className="text-white font-extrabold text-[11px] mt-0.5">4.6/5</div>
                      {/* Mini sparkline */}
                      <svg className="w-full h-3 mt-1.5 stroke-emerald-500 stroke-[1.5] fill-none" viewBox="0 0 40 10">
                        <path d="M0,8 Q5,5 10,6 T20,3 T30,4 T40,1" />
                      </svg>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-900 p-2 rounded">
                      <div className="text-[8px] text-slate-500 font-bold uppercase truncate">Resolved</div>
                      <div className="text-white font-extrabold text-[11px] mt-0.5">1,352</div>
                      {/* Mini sparkline */}
                      <svg className="w-full h-3 mt-1.5 stroke-amber-500 stroke-[1.5] fill-none" viewBox="0 0 40 10">
                        <path d="M0,9 Q5,6 10,7 T20,5 T30,6 T40,3" />
                      </svg>
                    </div>
                  </div>

                  {/* Graph Grid (Line chart + Themes Bar) */}
                  <div className="grid grid-cols-5 gap-3 flex-grow mb-1">
                    
                    {/* Line Chart Panel (Colspan 3) */}
                    <div className="col-span-3 bg-slate-900/40 border border-slate-900 rounded p-2.5 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold">
                        <span>FEEDBACK TREND</span>
                        <span>DAILY</span>
                      </div>
                      
                      {/* SVG Line Graph Mockup */}
                      <div className="h-[95px] relative mt-1 select-none">
                        <svg className="w-full h-full stroke-indigo-500 stroke-2 fill-none" viewBox="0 0 100 40">
                          {/* Grid Lines */}
                          <line x1="0" y1="10" x2="100" y2="10" stroke="#1e293b" strokeWidth="0.5" />
                          <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                          <line x1="0" y1="30" x2="100" y2="30" stroke="#1e293b" strokeWidth="0.5" />
                          
                          {/* Area Gradient */}
                          <path d="M0,40 L0,30 Q15,10 30,25 T60,18 T90,28 T100,20 L100,40 Z" fill="url(#indigoGrad)" opacity="0.1" stroke="none" />
                          
                          {/* Active Line */}
                          <path d="M0,30 Q15,10 30,25 T60,18 T90,28 T100,20" />
                          
                          {/* Gradients */}
                          <defs>
                            <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#4f46e5" />
                              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                        {/* Custom Dot and Indicator tooltip */}
                        <div className="absolute top-[25px] left-[55px] flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-white border border-indigo-600 animate-pulse" />
                        </div>
                      </div>

                      {/* X Axis dates */}
                      <div className="flex justify-between text-[7px] text-slate-600 font-bold mt-1 uppercase select-none">
                        <span>May 12</span>
                        <span>May 26</span>
                        <span>Jun 09</span>
                      </div>
                    </div>

                    {/* Top Themes Bar (Colspan 2) */}
                    <div className="col-span-2 bg-slate-900/40 border border-slate-900 rounded p-2.5 flex flex-col justify-between select-none">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold">
                        <span>TOP THEMES</span>
                        <span className="text-indigo-400">VIEW ALL</span>
                      </div>

                      {/* Progress bar lists */}
                      <div className="space-y-1.5 mt-2">
                        <div>
                          <div className="flex justify-between text-[7px] text-slate-400 font-bold">
                            <span>Delivery Experience</span>
                            <span>2,432</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full mt-0.5 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: "85%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[7px] text-slate-400 font-bold">
                            <span>Product Quality</span>
                            <span>1,985</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full mt-0.5 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: "70%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[7px] text-slate-400 font-bold">
                            <span>Customer Support</span>
                            <span>1,432</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full mt-0.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "50%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[7px] text-slate-400 font-bold">
                            <span>Pricing</span>
                            <span>1,098</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full mt-0.5 overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: "35%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating AI Prompt Assist card inside mockup */}
                  <div className="absolute bottom-4 left-[145px] right-4 bg-indigo-900/90 text-white rounded-lg p-2.5 shadow-lg border border-indigo-700/60 backdrop-blur-md flex items-center justify-between cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <div className="font-extrabold text-[9px]">Ask LOOP AI</div>
                        <div className="text-[7.5px] text-indigo-200 mt-0.5">Get instant answers from your feedback</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. TRUSTED BY / BRANDS TRUST BAR */}
      <section className={`py-12 border-t border-b transition-colors select-none ${
        isDarkMode ? "bg-slate-950/20 border-slate-900" : "bg-slate-50/50 border-slate-200/60"
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8">
            Trusted by teams who put customers first
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-50 dark:opacity-40">
            {/* Stripe Logo SVG */}
            <svg className="h-5 text-slate-700 dark:text-slate-300 fill-current" viewBox="0 0 80 32">
              <path d="M72.9 14.5c0-4.6-2.2-7.5-6.5-7.5-4.5 0-7.1 3.2-7.1 7.7 0 5 2.8 7.3 7.3 7.3 2.1 0 3.7-.4 4.8-.9 1.1-.5 1.7-1.1 1.7-1.1l-.8-2.6s-1.1.5-2.2.5c-1.8 0-3-1-3.1-2.4h11.2c.1-1 .1-1.6 0-1zm-9.3-1.6c.1-1.4 1-2.4 2.5-2.4 1.4 0 2.3.9 2.3 2.4h-4.8zm-12 1.6c0-2.5-1.7-3.8-4-3.8-1 0-2.3.4-3.1 1v-5.6l-4.1.9v19h4.1v-6.9c1-1 2.2-1.3 3.1-1.3 2.2.1 4-1.3 4-4.3zm-4.1 0c0 1.5-.7 2.1-1.8 2.1-1.1 0-1.8-.6-2.3-1.1v-4c.5-.5 1.2-1.1 2.3-1.1 1.1 0 1.8.6 1.8 2.1l-.2 2zm-12.7.2c-.8-.5-1.9-.9-2.9-.9-1.8 0-2.9.8-2.9 2.1 0 3.3 8.7 1.8 8.7 8.1 0 4.1-3.3 6.6-8.1 6.6-2 0-4.2-.6-5.4-1.3l.9-2.8c1.3.7 2.9 1.2 4.4 1.2 1.9 0 3.1-.9 3.1-2.2 0-3.6-8.7-2-8.7-8.1 0-4.3 3.5-6.6 7.9-6.6 1.8 0 3.5.4 4.8 1l-.8 2.9zm-13.8-6.1h-2.9v14.9h4.1v-10.8h2.9v-4.1l-4.1.2v-.2zm-8.8-3.4c-1.3 0-2.3 1-2.3 2.3 0 1.3 1 2.3 2.3 2.3 1.3 0 2.3-1 2.3-2.3 0-1.3-1-2.3-2.3-2.3zm2.1 7.5h-4.1v14.9h4.1v-14.9zm-7-2.3c-.9-.6-2.1-.9-3.2-.9-4.2 0-7 2.9-7 7.5 0 4.9 2.7 7.5 7.1 7.5 1.1 0 2.1-.2 3.1-.7v5.2l4.1-.9v-19l-4.1.3v1zm-2.9 11.2c-1.2 0-1.9-.6-2.4-1.1V12c.5-.5 1.2-1.1 2.4-1.1 1.2 0 1.9.6 1.9 2.1v2.5c.1 1.5-.7 2.1-1.9 2.1z"/>
            </svg>

            {/* Airbnb Logo SVG */}
            <svg className="h-7 text-slate-700 dark:text-slate-300 fill-current" viewBox="0 0 102 32">
              <path d="M14.6 28.5c-1 0-2-.3-2.7-1a8.6 8.6 0 0 1-2.7-6.2 8.7 8.7 0 0 1 2.7-6.3c1.7-1.6 4-2.1 6.2-1.3 1 .4 1.9 1 2.7 1.8l2.4-2.4c-1.3-1.3-3-2.3-5-2.8a12 12 0 0 0-9.8 2.2 12.1 12.1 0 0 0-3.8 8.8c0 3.2 1.3 6.3 3.6 8.5 2.3 2.3 5.4 3.6 8.6 3.6a12 12 0 0 0 9.2-4.1l-2.4-2.4c-.8.8-1.7 1.5-2.7 1.8-1.3.5-2.7.7-4 .5V28.5zM44.5 10.3c-2.3 0-4.5.9-6.2 2.6l-2.4-2.4c1.3-1.3 3-2.3 4.9-2.8a12 12 0 0 1 12 2.8l-2.4 2.4c-.8-.8-1.7-1.4-2.7-1.8-1.3-.5-2.6-.5-3.2-.8zM76.4 10.3c-1.3 0-2.6.2-3.8.7a8.7 8.7 0 0 0-4.9 5c-.5 1.2-.7 2.5-.7 3.8a8.8 8.8 0 0 0 2.5 6.3c1.7 1.7 4 2.5 6.4 2.5 1.3 0 2.6-.2 3.8-.7a8.7 8.7 0 0 0 4.9-5c.5-1.2.7-2.5.7-3.8s-.2-2.6-.7-3.8a8.7 8.7 0 0 0-4.9-5 9.7 9.7 0 0 0-3.8-.7h-.5zm0 15c-1.6 0-3-.8-3.7-2.2a6 6 0 0 1 0-5.6c.7-1.4 2.1-2.2 3.7-2.2s3 .8 3.7 2.2a6 6 0 0 1 0 5.6c-.7 1.4-2.1 2.2-3.7 2.2h.5zm-54.8 3.2c1.7 0 3.3-.8 4.3-2.2v2h3.5v-18h-3.5v7.2a6 6 0 0 0-4.3-1.9 6.2 6.2 0 0 0-6.1 6.2 6.2 0 0 0 6.1 6.2v.5zm.3-9c1.6 0 3 .8 3.7 2.2a6 6 0 0 1 0 5.6c-.7 1.4-2.1 2.2-3.7 2.2a3.7 3.7 0 0 1-3.7-3.7c0-2 1.6-3.7 3.7-3.7l.2-2.6zM96.1 19.8V10.7h-3.5v9a3.7 3.7 0 0 1-7.4 0v-9h-3.5v9c0 4 3.2 7.2 7.2 7.2s7.2-3.2 7.2-7.2zM21.6 2c2 0 3.6 1.6 3.6 3.6S23.6 9.2 21.6 9.2 18 7.6 18 5.6 19.6 2 21.6 2z"/>
            </svg>

            {/* Amazon Logo SVG */}
            <svg className="h-6 text-slate-700 dark:text-slate-300 fill-current" viewBox="0 0 80 24">
              <path d="M57.6 10.3c.7-1.3 1.9-2 3.3-2.3 1.3-.2 2.7.2 3.7.9V8h3.3v13h-3.3v-6.9c0-1.8-1-2.7-2.2-2.7s-2.1.8-2.6 1.8v7.8h-3.3v-13h3.3v2.3h-.2zm-12.7 2.3c.8-1.5 2.1-2.3 3.6-2.3 2 0 3.4 1.4 3.4 3.4v7.3h-3.3v-6.9c0-1-1-1.7-1.9-1.7s-1.8.8-2.1 1.7v6.9H41.3V8h3.3v4.6h.3zm-13.8 6c0 1-.8 1.7-1.8 1.7-1.1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8c1 0 1.8.8 1.8 1.9zm3.3-5.2c-.8-.5-1.9-.9-2.9-.9-3 0-5.1 2.2-5.1 5.3s2.1 5.3 5.1 5.3c1 0 2.1-.4 2.9-.9V21h3.3V8h-3.3v3.4zm-14.8.4h3.7l-4.8 6.9 4.8 6.1H29l-3.3-4.3-3.3 4.3h-4.3l4.8-6.1-4.8-6.9h4.3l3.3 4.8 3.3-4.8zm-11-1.2c-.8-.5-1.9-.9-2.9-.9-3 0-5.1 2.2-5.1 5.3s2.1 5.3 5.1 5.3c1 0 2.1-.4 2.9-.9V21H9.9V8H6.6v3.4zM3.3 22c7.6 5.2 19 6.2 27.6 1.7 1.3-.7 2.9-1.7 2.4-3.1-.4-1-1.8-.8-2.8-.5-7.6 2.3-17.1 2-24.8-1.7C4.7 18 3.3 18.2 3.3 20.3s.1 1.7 0 1.7zm28.6-4.6c.5.5.9.1.9-.6l.1-3.6c0-.7-.6-1-1.1-.4l-2.4 2.3c-.5.5-.3.9.4.9l2.1.4z"/>
            </svg>

            {/* Spotify Logo SVG */}
            <svg className="h-6.5 text-slate-700 dark:text-slate-300 fill-current flex items-center" viewBox="0 0 102 32">
              <path d="M14.6 0A14.6 14.6 0 0 0 0 14.6c0 8.1 6.5 14.6 14.6 14.6 8.1 0 14.6-6.5 14.6-14.6A14.6 14.6 0 0 0 14.6 0zm6.7 21c-.3.4-.8.5-1.2.3A36 36 0 0 1 8 18.4c-.4-.1-.7-.6-.5-1 .1-.4.6-.7 1-.5 3.8 1.1 8 2.2 11.5 3.3.4.1.6.6.4.8zm1.8-4c-.3.5-1 .7-1.5.4a43 43 0 0 1-13.8-3.7c-.5-.3-.7-.9-.4-1.4.3-.5.9-.7 1.4-.4A39.4 39.4 0 0 0 21.8 16c.5.3.7.9.4 1.4v-.4zm.1-4c-.4.6-1.2.8-1.8.4a47.3 47.3 0 0 1-16.2-4.5c-.6-.3-.9-1.1-.5-1.7.3-.6 1.1-.9 1.7-.5A44.2 44.2 0 0 0 21.3 12c.7.4.9 1.2.5 1.8l-.4-.4zM42.4 13h-2.9v14.9h4.1V17.8c1-1 2.2-1.3 3.1-1.3 2.2.1 4-1.3 4-4.3 0-2.5-1.7-3.8-4-3.8-1 0-2.3.4-3.1 1l-.2-1h-.2zm9-3.4c-1.3 0-2.3 1-2.3 2.3 0 1.3 1 2.3 2.3 2.3 1.3 0 2.3-1 2.3-2.3S52.7 9.6 51.4 9.6zm2.1 7.5H49.4v14.9H53.5V17.1zM65.4 13h-2.9v14.9h4.1V17.8c1-1 2.2-1.3 3.1-1.3 2.2.1 4-1.3 4-4.3 0-2.5-1.7-3.8-4-3.8-1 0-2.3.4-3.1 1l-.2-1h-.2zm9 4c-1.3 0-2.6.2-3.8.7a8.7 8.7 0 0 0-4.9 5c-.5 1.2-.7 2.5-.7 3.8a8.8 8.8 0 0 0 2.5 6.3c1.7 1.7 4 2.5 6.4 2.5 1.3 0 2.6-.2 3.8-.7a8.7 8.7 0 0 0 4.9-5c.5-1.2.7-2.5.7-3.8s-.2-2.6-.7-3.8a8.7 8.7 0 0 0-4.9-5 9.7 9.7 0 0 0-3.8-.7h-.5zm0 15c-1.6 0-3-.8-3.7-2.2a6 6 0 0 1 0-5.6c.7-1.4 2.1-2.2 3.7-2.2s3 .8 3.7 2.2a6 6 0 0 1 0 5.6c-.7 1.4-2.1 2.2-3.7 2.2h.5zM96.1 19.8V10.7h-3.5v9a3.7 3.7 0 0 1-7.4 0v-9h-3.5v9c0 4 3.2 7.2 7.2 7.2s7.2-3.2 7.2-7.2z"/>
            </svg>

            {/* Microsoft Logo SVG */}
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
                <div className="w-1.8 h-1.8 bg-[#F25022]" />
                <div className="w-1.8 h-1.8 bg-[#7FBA00]" />
                <div className="w-1.8 h-1.8 bg-[#00A4EF]" />
                <div className="w-1.8 h-1.8 bg-[#FFB900]" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 tracking-tight text-sm select-none font-sans">Microsoft</span>
            </div>

            {/* HubSpot Logo SVG */}
            <div className="flex items-center gap-1.5">
              {/* sprocket logo */}
              <svg className="w-4 h-4 text-[#FF7A59] fill-current" viewBox="0 0 24 24">
                <path d="M21.5 10.5h-5.22a4.5 4.5 0 0 0-8.56 0H2.5A1.5 1.5 0 0 0 1 12a1.5 1.5 0 0 0 1.5 1.5h5.22a4.5 4.5 0 0 0 8.56 0h5.22A1.5 1.5 0 0 0 23 12a1.5 1.5 0 0 0-1.5-1.5zM12 14.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
              </svg>
              <span className="font-extrabold text-slate-700 dark:text-slate-300 tracking-tight text-sm select-none font-sans">HubSpot</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 w-full relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Streamline your feedback cycle
          </h2>
          <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
            Loop provides powerful features engineered to help teams capture, categorize, and act on insights instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: AI-Powered Insights */}
          <div className={`p-6.5 rounded-2xl border transition-all ${
            isDarkMode ? "bg-slate-900/40 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200/60 hover:shadow-md hover:border-slate-300/80"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">AI-Powered Insights</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Auto-classify, cluster, and extract key customer sentiments using advanced semantic AI models.
            </p>
          </div>

          {/* Card 2: All Channels. One Place */}
          <div className={`p-6.5 rounded-2xl border transition-all ${
            isDarkMode ? "bg-slate-900/40 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200/60 hover:shadow-md hover:border-slate-300/80"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">All Channels. One Place.</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Unify feedback logs from reviews, support chats, team tickets, surveys, and NPS channels.
            </p>
          </div>

          {/* Card 3: Actionable Analytics */}
          <div className={`p-6.5 rounded-2xl border transition-all ${
            isDarkMode ? "bg-slate-900/40 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200/60 hover:shadow-md hover:border-slate-300/80"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Actionable Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Powerful real-time dashboards to track trends, identify recurring pain-points, and view score trends.
            </p>
          </div>

          {/* Card 4: Secure & Scalable */}
          <div className={`p-6.5 rounded-2xl border transition-all ${
            isDarkMode ? "bg-slate-900/40 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200/60 hover:shadow-md hover:border-slate-300/80"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Secure & Scalable</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enterprise-grade isolation protocols with strict role-based access restrictions and workspace privacy.
            </p>
          </div>

        </div>
      </section>

      {/* 5. INDIGO CTA BANNER SECTION */}
      <section className="max-w-7xl mx-auto px-6 w-full mb-16 relative">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8 z-10">
          {/* Decorative pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Ready to transform feedback into growth?
            </h3>
            <p className="mt-2 text-sm text-indigo-200 max-w-lg leading-relaxed">
              Get started in seconds. LOOP automatically processes comments so your product, support, and success teams can focus on growth.
            </p>
          </div>

          <Link
            href="/login"
            className="relative z-10 px-6 py-3.5 bg-white hover:bg-slate-50 text-indigo-700 font-bold text-sm tracking-wide rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            Get Started for Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 6. PREMIUM FOOTER */}
      <footer className={`py-8 text-center text-xs border-t transition-colors w-full mt-auto ${
        isDarkMode ? "bg-slate-950/40 border-slate-900 text-slate-500" : "bg-white border-slate-200/60 text-slate-400"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs uppercase tracking-widest text-slate-500">Loop</span>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <span>© {new Date().getFullYear()} Project LOOP. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:underline transition-all">Privacy Policy</a>
            <a href="#" className="hover:underline transition-all">Terms of Service</a>
            <a href="#" className="hover:underline transition-all">Support Desk</a>
          </div>
        </div>
      </footer>

    </main>
  );
}