import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-white font-sans selection:bg-primary/30">
      {/* Premium Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-2">
          {/* Logo / Brand */}
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Project LOOP
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Hexagon icon */}
          <div className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer p-1">
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 fill-current"
              style={{ color: "#8a99ad" }}
            >
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M12 2L20.66 7v10L12 22L3.34 17V7L12 2zm0 6.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" 
              />
            </svg>
          </div>
          
          {/* Sign In Button */}
          <Link 
            href="/login"
            className="px-6 py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center cursor-pointer uppercase"
          >
            SIGN IN
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto">
        <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
          Project LOOP
        </h1>
        <p className="mt-6 text-lg text-slate-400 leading-relaxed">
          AI Powered Customer Feedback Intelligence Platform
        </p>
        
        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-base transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/20 active:scale-98 flex items-center gap-2"
          >
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-base transition-all duration-200"
          >
            Create Account
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900/50 w-full mt-auto">
        © {new Date().getFullYear()} Project LOOP. All rights reserved.
      </footer>
    </main>
  );
}