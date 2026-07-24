import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-text-primary font-sans selection:bg-primary/20">
      {/* Premium Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white shadow-sm mt-4 rounded-xl">
        <div className="flex items-center gap-2">
          {/* Logo / Brand */}
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-ai-accent bg-clip-text text-transparent">
            🔁 Project LOOP
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sign In Button */}
          <Link 
            href="/login"
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-95 flex items-center justify-center cursor-pointer uppercase"
          >
            SIGN IN
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto py-16">
        <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-6 animate-pulse">
          AI-Driven Feedback Intelligence
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-tight">
          Close the Loop on <br/>
          <span className="bg-gradient-to-r from-primary via-indigo-600 to-ai-accent bg-clip-text text-transparent">
            Customer Feedback
          </span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl">
          Ingest, analyze, and cluster multi-channel customer reviews, support tickets, and NPS surveys. Ask plain English questions and get grounded, evidence-backed insights in real time.
        </p>
        
        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-base transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 active:scale-98 flex items-center gap-2"
          >
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-text-secondary hover:text-text-primary font-bold text-base transition-all duration-200 shadow-sm"
          >
            Create Account
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs text-text-muted border-t border-slate-200/50 w-full mt-auto bg-white">
        © {new Date().getFullYear()} Project LOOP. All rights reserved.
      </footer>
    </main>
  );
}