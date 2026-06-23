import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Mail, Lock, ChevronDown } from "lucide-react";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee"); // Matches 'role' instead of userType
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const signupSubmit = async (userDetails) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      if (res.ok) {
        toast.success(`Account registered successfully!`);
        navigate("/login");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || `Registration rejected. Please verify your data.`);
      }
    } catch (error) {
      console.error("Authentication server communication failure:", error);
      toast.error("Could not connect to registration server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForm = (e) => {
    e.preventDefault();

    // Creates a unique user ID automatically so Mongoose validation passes safely
    const customUserId = `EMP-${username.replace(/\s+/g, '').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const userDetails = {
      userId: customUserId,       // ✅ Added missing required schema key
      username: username.trim(),  // ✅ Lowercase 'username' to match database schema
      email: email.trim(),
      role: role,                 // ✅ Matches 'role' exactly
      password
    };

    signupSubmit(userDetails);
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased selection:bg-emerald-500/20">
      
      {/* Background Ambient Glow Patterns */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,rgba(0,135,68,0.1),transparent_60%)] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none"></div>

      {/* Main Form Registration Card */}
      <div className="w-full max-w-md bg-[#0b0f19] border border-slate-800/80 shadow-[0_32px_64px_rgba(0,0,0,0.6)] rounded-2xl p-8 space-y-6 relative backdrop-blur-sm">
        
        {/* Heidelberg System Identity Banner */}
        <div className="text-center">
          <div className="flex flex-col items-center">
            <div className="text-2xl tracking-tight select-none">
              <span className="font-black text-[#008744]">HEIDELBERG</span>
              <span className="font-light text-[#008744]">CEMENT</span>
            </div>
            <div className="text-[10px] font-black text-slate-500 tracking-[0.35em] mt-1 uppercase font-mono">
              Portal Registration
            </div>
          </div>
        </div>

        <div className="space-y-1 text-left">
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-400">Register a profile node to access your operational workspace.</p>
        </div>

        <form onSubmit={submitForm} className="space-y-4 text-left">
          
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400" htmlFor="username">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Username</span>
            </label>
            <input
              type="text"
              id="username"
              placeholder="e.g., karan"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 hover:border-slate-700/80 transition-all duration-200"
            />
          </div>

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400" htmlFor="email">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              id="email"
              placeholder="name@heidelberg.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 hover:border-slate-700/80 transition-all duration-200"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400" htmlFor="password">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Password</span>
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 hover:border-slate-700/80 transition-all duration-200"
            />
          </div>

          {/* Account Role Dropdown Menu */}
          <div className="space-y-1.5 relative">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
              <span>Account Privilege Level</span>
            </label>
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full flex items-center justify-between bg-[#0a0f1d] border border-slate-800 text-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none hover:border-slate-700 focus:border-emerald-500/50 transition-all duration-200"
            >
              <span className="capitalize">{role}</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {roleDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-[#0e1426] border border-slate-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <ul className="p-1 space-y-0.5">
                  {['employee', 'admin'].map((roleOpt) => (
                    <li key={roleOpt}>
                      <button
                        type="button"
                        onClick={() => {
                          setRole(roleOpt);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm rounded-lg capitalize transition-colors
                          ${role === roleOpt ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                      >
                        {roleOpt}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700/50 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-[0_4px_15px_rgba(16,185,129,0.2)] active:scale-[0.98]"
            >
              {isSubmitting ? "Registering account..." : "Complete Registration"}
            </button>
          </div>

        </form>

        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-center text-xs font-medium text-slate-500">
          <span>Already registered?</span>
          <Link className="text-emerald-400 hover:text-emerald-300 font-semibold ml-1.5 no-underline transition-colors" to="/login">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;