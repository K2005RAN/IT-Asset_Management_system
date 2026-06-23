import React from 'react';
import CreateUser from '../components/CreateUser';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewUser = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-slate-300">
      
      {/* Top Header Navigation Section */}
      <div className="border-b border-slate-800/60 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/user-management')}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mb-3 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Privileges</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Account Provisioning
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1.5">Add New User</h2>
          <p className="text-sm text-slate-400 mt-1">Create a new corporate account and configure security permissions.</p>
        </div>
      </div>

      {/* Main Form Context Frame */}
      <div className="max-w-xl mx-auto bg-[#0b0f19] border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden relative">
        
        {/* Modern Accent Glow Layers */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 h-32 w-32 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-tr-full pointer-events-none"></div>

        {/* Form Title Banner */}
        <div className="px-6 py-5 border-b border-slate-800/60 bg-slate-900/20 flex items-center space-x-3 relative z-10">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Account Credentials</h3>
          </div>
        </div>

        {/* Injected Core Inner Creation Form */}
        <div className="p-6 relative z-10">
          <CreateUser />
        </div>

      </div>

    </div>
  );
};

export default NewUser;