import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, Calendar, Wrench, IndianRupee, ClipboardList, CheckCircle2 } from 'lucide-react';

const RepairHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRepairLogs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/repair-history');
                setHistory(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to query maintenance ledger tracks:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRepairLogs();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center font-sans">
                <Loader2 className="w-10 h-12 text-[#10b981] animate-spin" />
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-4 animate-pulse">Compiling Workshop Records Ledger...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-slate-200 antialiased font-sans p-4 md:p-8 flex flex-col items-center pb-24">
            <div className="w-full max-w-7xl bg-[#111827] border border-slate-800 shadow-[0_32px_64px_rgba(0,0,0,0.7)] rounded-2xl overflow-hidden relative">
                
                {/* Header Context Banner */}
                <div className="px-8 py-6 border-b border-slate-800/80 bg-slate-900/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-white">Maintenance Audit Logs</h3>
                            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">Independent Third-Party Repair Histories</p>
                        </div>
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="inline-flex items-center px-4 py-2 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-800 transition-all active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Return to Dashboard
                    </button>
                </div>

                {/* Main Data Ingestion Ledger Table */}
                <div className="p-6">
                    {history.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
                            <Wrench className="w-8 h-8 text-slate-700" />
                            <h4 className="text-sm font-bold text-slate-500 font-mono tracking-wide">Pristine Ecosystem: No Historic Repair Actions Logged</h4>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-800/60">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-[#141d2f]/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider font-mono">
                                        <th className="py-4 px-5">Equipment Identity</th>
                                        <th className="py-4 px-5">Vendor Target Allocations</th>
                                        <th className="py-4 px-5">Financial Cost Bounds</th>
                                        <th className="py-4 px-5">Ecosystem Status</th>
                                        <th className="py-4 px-5">Timeline Tracking Logs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono text-[12px] bg-[#0b111e]/20">
                                    {history.map((log) => (
                                        <tr key={log._id} className="hover:bg-[#162136]/20 transition-colors">
                                            
                                            {/* Column 1: Asset Core Details */}
                                            <td className="py-4 px-5">
                                                <div className="font-bold text-emerald-400">{log.assetId}</div>
                                                <div className="text-[11px] text-white font-sans font-medium mt-0.5">{log.assetName || log.hardwareModelNo}</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">Plant Segment: {log.plant}</div>
                                            </td>

                                            {/* Column 2: Vendor Entity */}
                                            <td className="py-4 px-5 font-sans">
                                                <div className="font-bold text-slate-200 text-xs flex items-center">
                                                    <Wrench className="w-3 h-3 text-amber-500 mr-1.5" /> {log.vendorName}
                                                </div>
                                            </td>

                                            {/* Column 3: Estimation Prices */}
                                            <td className="py-4 px-5">
                                                <div className="font-bold text-emerald-400 flex items-center text-xs">
                                                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500 mr-0.5" />
                                                    {log.expectedPrice ? log.expectedPrice.toLocaleString('en-IN') : '0'}
                                                </div>
                                            </td>

                                            {/* Column 4: Status Badges */}
                                            <td className="py-4 px-5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                                    log.status === 'Completed' 
                                                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                                                    : 'bg-amber-500/5 text-amber-400 border-amber-500/10 animate-pulse'
                                                }`}>
                                                    {log.status === 'Completed' ? '✅ Stock Restored' : '🔧 Workshop Active'}
                                                </span>
                                            </td>

                                            {/* Column 5: Exact Historical Timestamps */}
                                            <td className="py-4 px-5 text-slate-400 font-mono text-[11px] space-y-1">
                                                <div>
                                                    <span className="text-slate-600 font-bold uppercase text-[9px] block">📅 Workshop Out-bound:</span>
                                                    {new Date(log.sentToRepairAt).toLocaleDateString('en-IN')} @ {new Date(log.sentToRepairAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </div>
                                                
                                                {/* 🌟 DYNAMIC RENDERING: Displays the exact time-log of when it was returned to stockpool */}
                                                {log.status === 'Completed' ? (
                                                    <div className="text-emerald-400/80">
                                                        <span className="text-emerald-600 font-bold uppercase text-[9px] block">📅 Restored Normal Stock:</span>
                                                        {new Date(log.restoredToStockAt).toLocaleDateString('en-IN')} @ {new Date(log.restoredToStockAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="text-amber-600 font-bold uppercase text-[9px] block">📅 Expected Return Bounds:</span>
                                                        {log.expectedReturnDate ? new Date(log.expectedReturnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Open Target Timeframe'}
                                                    </div>
                                                )}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default RepairHistory;