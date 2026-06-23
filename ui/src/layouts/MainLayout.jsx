import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LogOut, LayoutDashboard, Layers, ArrowLeftRight, Users, Wrench } from 'lucide-react'; // 🌟 Added Wrench Icon Component
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve user role session data (defaults to 'admin' if empty)
  const userRole = localStorage.getItem('userRole') || 'admin'; 

  const handleLogout = () => {
    localStorage.removeItem('userRole'); 
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getDashboardPath = () => {
    return userRole === 'admin' ? '/admin' : '/employee-dashboard'; 
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-[#e2e8f0] flex flex-col antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Sticky Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0e1422]/90 backdrop-blur-md border-b border-slate-800/60 shadow-xl shadow-black/10 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Corporate Branding Logo */}
          <Link to={getDashboardPath()} className="no-underline block group">
            <div className="flex flex-col items-end line-height-1">
              <div className="text-2xl tracking-tight select-none">
                <span className="font-black text-[#008744] transition-colors group-hover:text-emerald-400">HEIDELBERG</span>
                <span className="font-light text-[#008744] transition-colors group-hover:text-emerald-400">CEMENT</span>
              </div>
              <div className="text-[11px] font-black text-slate-400 tracking-[0.3em] mt-0.5 mr-[-0.3em]">
                INDIA
              </div>
            </div>
          </Link>

          {/* Navigation Menu Links */}
          <div className="flex items-center space-x-8">
            
            {/* Dashboard Link */}
            <Link 
              to={getDashboardPath()} 
              className={`no-underline font-medium text-sm transition-colors tracking-wide flex items-center space-x-1.5 ${
                location.pathname === '/admin' || location.pathname === '/employee-dashboard'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            {/* Admin-Only Navigation Links */}
            {userRole === 'admin' && (
              <>
                {/* Assets Link */}
                <Link 
                  to="/asset-inventory" 
                  className={`no-underline font-medium text-sm transition-colors tracking-wide flex items-center space-x-1.5 ${
                    location.pathname === '/asset-inventory' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Assets</span>
                </Link>
                
                {/* Assignments Link */}
                <Link 
                  to="/assigned-assets" 
                  className={`no-underline font-medium text-sm transition-colors tracking-wide flex items-center space-x-1.5 ${
                    location.pathname === '/assigned-assets' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Assignments</span>
                </Link>

                {/* 🌟 Repair History Link (Direct Global Linkage Token Access Point) */}
                <Link 
                  to="/repair-history" 
                  className={`no-underline font-medium text-sm transition-colors tracking-wide flex items-center space-x-1.5 ${
                    location.pathname === '/repair-history' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  <span>Repair Logs</span>
                </Link>

                {/* Privileges Link */}
                <Link 
                  to="/user-management" 
                  className={`no-underline font-medium text-sm transition-colors tracking-wide flex items-center space-x-1.5 ${
                    location.pathname === '/user-management' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Privileges</span>
                </Link>
              </>
            )}
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Main Content Render View Window */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        <Outlet />
      </main>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default MainLayout;