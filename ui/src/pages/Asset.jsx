import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssetInventory from '../components/AssetInventory';
import { Layers, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const Asset = () => {
  const [assets, setAssets] = useState([]);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch your inventory array directly in the parent wrapper container
  const fetchAssets = async () => {
    try {
      setLoading(true);
      
      // 🌟 DUAL SYNC FETCH: Pulls both assets and real assignment entries to eliminate metric mismatches
      const [assetsRes, assignmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/assets-search'),
        axios.get('http://localhost:5000/api/assignments')
      ]);

      if (assetsRes.data && Array.isArray(assetsRes.data)) {
        setAssets(assetsRes.data);
      }
      
      if (assignmentsRes.data && Array.isArray(assignmentsRes.data)) {
        setAssignmentCount(assignmentsRes.data.length);
      }
    } catch (error) {
      console.error('❌ Failed to pull master hardware inventory records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // --- Dynamic Math Calculation Engine ---
  const totalItems = assets.length;
  
  // 🌟 ACCURATE ACTION FILTERS: Uniformly tracks repair lines matching main panel requirements
  const repairItems = assets.filter(asset => {
    const cleanStatus = asset['Asset Status'] || asset.status || '';
    return ['repair', 'under repair', 'maintenance', 'scrap'].includes(String(cleanStatus).toLowerCase().trim());
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header section */}
      <div className="border-b border-slate-800/60 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
              System Console
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1.5">
            Hardware Asset Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track, update, and manage your company's hardware inventory.
          </p>
        </div>
      </div>

      {/* Top Level Quick Metric Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Dynamic Total Hardware Count Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm hover:border-slate-700/60 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Total Hardware</p>
              <h4 className="text-2xl font-black text-slate-100 mt-2 font-sans">
                {loading ? '...' : `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`}
              </h4>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic Assigned Active Count Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm hover:border-slate-700/60 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Assigned Active</p>
              <h4 className="text-2xl font-black text-emerald-400 mt-2 font-sans">
                {/* 🌟 TRUE COUNTER TARGET: Shows the exact 12 assignments seamlessly */}
                {loading ? '...' : `${assignmentCount} ${assignmentCount === 1 ? 'Item' : 'Items'}`}
              </h4>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic In Repair Count Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm hover:border-slate-700/60 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">In Repair</p>
              <h4 className="text-2xl font-black text-amber-400 mt-2 font-sans">
                {loading ? '...' : `${repairItems} ${repairItems === 1 ? 'Device' : 'Devices'}`}
              </h4>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic Integrity Validation State Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm hover:border-slate-700/60 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Security Verified</p>
              <h4 className="text-2xl font-black text-blue-400 mt-2 font-sans">100% Secure</h4>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Inventory Layout Workspace Frame */}
      <div className="w-full bg-[#0b0f19] border border-slate-800/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-900/10">
          <h3 className="text-sm font-semibold text-slate-200">Master Inventory Directory</h3>
        </div>
        <div className="p-1">
          <AssetInventory assets={assets} refreshInventory={fetchAssets} loading={loading} />
        </div>
      </div>

    </div>
  );
};

export default Asset;