import React from 'react';
import UserManagement from '../components/UserManagement';
import { Users } from 'lucide-react';

const UserManagementPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-300">
      
      {/* Dynamic Header Titles */}
      <div className="border-b border-slate-800/60 pb-5">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase font-mono">
            Identity Console
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mt-1.5">
          User Account Management
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Review staff profiles, manage system access, and update account permissions.
        </p>
      </div>

      {/* Main Core Component Box Frame Workspace */}
      <div className="w-full bg-[#0b0f19] border border-slate-800/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
        
        {/* Table Workspace Subheader Title */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/10 flex items-center space-x-2.5">
          <Users className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Registered Staff Profiles</h3>
        </div>

        {/* Dynamic inner content layout */}
        <UserManagement />

      </div>

    </div>
  );
};

export default UserManagementPage;