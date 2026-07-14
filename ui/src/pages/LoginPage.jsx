import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Lock, Mail } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const loginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loginDetails = { email, password };

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginDetails),
      });

      if (res.ok) {
        const data = await res.json();
        const userType = data.userType || 'admin'; 
        
        // ── CRITICAL ADDITION: Save user configurations to browser memory ──
        localStorage.setItem('userRole', userType);
        localStorage.setItem('userEmail', email.toLowerCase().trim()); // Feeds the employee dashboard query context
        
        if (data.token) localStorage.setItem('token', data.token);

        toast.success(`Welcome back! Logged in as ${userType}`);

        if (userType === 'employee') {
          return navigate("/employee-dashboard");
        } else {
          return navigate("/admin"); 
        }
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Could not connect to the server. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased selection:bg-emerald-500/20">
      
      {/* Background Subtle Glows */}
      <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,rgba(0,135,68,0.12),transparent_60%)] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] pointer-events-none"></div>

      {/* Main Login Card Box */}
      <div className="w-full max-w-md bg-[#0b0f19] border border-slate-800/80 shadow-[0_32px_64px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden relative backdrop-blur-sm p-8 space-y-6">
        
        {/* Branding Title */}
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center">
            <div className="text-2xl tracking-tight select-none">
              <span className="font-black text-[#008744]">HEIDELBERG</span>
              <span className="font-light text-[#008744]">CEMENT</span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 tracking-[0.25em] mt-1 uppercase font-mono">
              Asset Tracker
            </div>
          </div>
        </div>

        {/* Header Text Block */}
        <div className="space-y-1 text-left">
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">Account Login</h2>
          <p className="text-xs text-slate-400">Sign in to manage and check your hardware devices.</p>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={loginSubmit} className="space-y-4 text-left">
          
          {/* Email Address field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400" htmlFor="email">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="name@heidelberg.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 hover:border-slate-700/80 transition-all duration-200"
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400" htmlFor="password">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Password</span>
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 hover:border-slate-700/80 transition-all duration-200"
            />
          </div>

          {/* Submission Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700/50 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-[0_4px_15px_rgba(16,185,129,0.2)] active:scale-[0.98]"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        {/* Secure Access Footer Panel Notice */}
        <div className="pt-4 border-t border-slate-800/60 flex flex-col items-center justify-center text-center text-xs font-medium text-slate-500 space-y-1">
          <span className="text-slate-400 font-semibold">Authorized Personnel Only</span>
          <p className="text-[11px] text-slate-500 max-w-[280px] leading-relaxed">
            If you do not have a login profile, please contact your IT Administrator to create your account.
          </p>
        </div>

      </div>
    </div>
  );
};

const getUserType = () => {
  const authToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("Authtoken"))
    ?.split("=")[1];

  if (!authToken) return null;
  const decoded = jwtDecode(authToken);
  return decoded.userType;
};

export { LoginPage as default, getUserType };