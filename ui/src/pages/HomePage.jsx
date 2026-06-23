import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, BarChart3, Wrench, ShieldAlert, ArrowUpRight, Cpu, Radio, Fingerprint } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060913] text-[#f1f5f9] font-sans antialiased relative overflow-hidden flex flex-col justify-between selection:bg-emerald-500/30">
      
      {/* ── HIGH-END BACKGROUND ARCHITECTURE ── */}
      {/* Cybernetic Mesh Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      
      {/* Hyper-Focused Dynamic Aurora Blur Orbs */}
      <div className="absolute top-[-20%] left-[-10%] h-[700px] w-[700px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_70%)] blur-[80px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute top-[30%] right-[-20%] h-[800px] w-[800px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] h-[600px] w-[600px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.04),transparent_65%)] blur-[90px] pointer-events-none"></div>

      {/* ── TOP STREAMLINED NAVBAR ── */}
      <nav className="w-full max-w-7xl mx-auto px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3 group">
          <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all group-hover:border-emerald-500/40">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <div className="text-xl tracking-tight select-none font-black font-mono">
              <span className="text-white">HEIDELBERG</span>
              <span className="text-[#008744] font-light">CEMENT</span>
            </div>
            <div className="text-[9px] font-bold text-slate-500 tracking-[0.4em] mt-1 uppercase font-mono">
                               INDIA
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/login')}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs font-black uppercase tracking-widest text-slate-300 rounded-xl group bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-emerald-500 group-hover:to-teal-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-emerald-800/30 transition-all active:scale-95 shadow-lg shadow-black/40"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-[#080c14] rounded-[10px] group-hover:bg-opacity-0">
            Sign In
          </span>
        </button>
      </nav>

      {/* ── CINEMATIC HERO FIELD ── */}
      <header className="max-w-4xl mx-auto text-center px-8 pt-16 pb-6 relative z-10 space-y-8">
        {/* Live Active Telemetry Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-[#0a1224] border border-slate-800/80 rounded-full shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] font-mono flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Database Connection: Active
          </span>
        </div>
        
        {/* Typographic Layout Statement */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-none">
            Asset Management <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(52,211,153,0.15)]">
              Control Interface
            </span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed font-sans">
            Centralized ecosystem designed to track hardware assets, dynamic asset assignments, and system deployment status in real time.
          </p>
        </div>

        {/* Action Call Controls */}
        <div className="pt-2">
          <button 
            onClick={() => navigate('/login')}
            className="inline-flex items-center space-x-2.5 px-7 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 shadow-[0_4px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_40px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group"
          >
            <span>Launch Work Station</span>
            <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </header>

      {/* ── ASYMMETRICAL MODERN BENTO GRID ── */}
      <section className="max-w-6xl mx-auto px-8 pb-16 w-full relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Device Tracking */}
          <div className="bg-gradient-to-b from-[#111827]/60 to-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:border-slate-700/80 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] group">
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10 w-fit group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Device Mapping</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Monitor machine locations, operational lifecycle pipelines, and physical asset hardware trails.
              </p>
            </div>
          </div>

          {/* Card 2: Utilization Metrics */}
          <div className="bg-gradient-to-b from-[#111827]/60 to-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:border-slate-700/80 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] group">
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10 w-fit group-hover:scale-110 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Usage Analytics</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Compile system stock ledger records instantly to optimize unallocated backup inventory buffers.
              </p>
            </div>
          </div>

          {/* Card 3: Maintenance Logs */}
          <div className="bg-gradient-to-b from-[#111827]/60 to-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:border-slate-700/80 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] group">
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10 w-fit group-hover:scale-110 transition-transform">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Service Tickets</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Trace repair records, technical adjustments, and hardware units currently active in servicing bays.
              </p>
            </div>
          </div>

          {/* Card 4: Access Privileges */}
          <div className="bg-gradient-to-b from-[#111827]/60 to-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:border-slate-700/80 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] group">
            <div className="space-y-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10 w-fit group-hover:scale-110 transition-transform">
                <Fingerprint className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Role Access</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Govern corporate access control maps and modify employee security clear levels in unified channels.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── PLATFORM COMPLIANCE FOOTER ── */}
     {/* ── FOOTER ── */}
<footer className="w-full text-center py-6 border-t border-slate-900 text-[10px] font-bold tracking-[0.15em] text-slate-600 font-mono uppercase bg-[#05070e]/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
  <span>&copy; {new Date().getFullYear()} HeidelbergCement India Ltd. All rights reserved.</span>
  <span className="hidden sm:inline text-slate-800">•</span>
  <span>
    Developed by{' '}
    <a 
      href="https://www.linkedin.com/in/karan-rai-a961aa292/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-emerald-500 hover:text-emerald-400 font-black no-underline transition-colors tracking-widest normal-case font-sans text-[11px]"
    >
      Karan Rai
    </a>
  </span>
</footer>

    </div>
  );
};

export default HomePage;