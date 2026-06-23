import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, BarChart2, MapPin, ChevronRight, Loader2, RefreshCw, Users, Laptop, AlertCircle, Search, Database, EyeOff, Trash2, Download } from 'lucide-react';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({
        totalAssets: 0,
        assignedCount: 0,
        availableStock: 0,
        pendingCount: 0, 
        totalStaff: 0, 
        distribution: []
    });

    const [assets, setAssets] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    
    // ── 🎯 ALIGNED DYNAMIC FILTER TRACKS MATRICES ──
    const initialFilters = { 
        location: "", 
        assignedToName: "", 
        department: "", 
        assetType: "", 
        assetStatus: "", 
        serviceTag: "",
        hardwareModelNo: "", 
        invoiceNo: "",
        poNo: "",
        search: "" 
    };

    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [hasAppliedFilter, setHasActiveFilter] = useState(false);

    // ── 🎯 REPAIR MODAL INTERACTIVE STATE ENGINE ──
    const [repairModal, setRepairModal] = useState({ show: false, assetId: null, label: "" });
    const [repairForm, setRepairForm] = useState({ vendorName: "", expectedReturnDate: "", expectedPrice: "" });

    // ── 🎯 ANTI-LOOP GUARD REF CONTROLLER ──
    const isFetchingRef = useRef(false);

    useEffect(() => {
        if (!isFetchingRef.current) {
            fetchLiveSystemData();
        }
    }, []); 

    const fetchLiveSystemData = async () => {
        if (isFetchingRef.current) return;
        
        isFetchingRef.current = true;
        setRefreshing(true);
        
        try {
            const [assetsRes, assignmentsRes, staffRes] = await Promise.allSettled([
                axios.get('http://localhost:5000/api/admin/assets-search'), 
                axios.get('http://localhost:5000/api/assignments'),
                axios.get('http://localhost:5000/api/admin/employees')
            ]);

            const assetsData = assetsRes.status === 'fulfilled' && Array.isArray(assetsRes.value.data) ? assetsRes.value.data : [];
            const assignmentsData = assignmentsRes.status === 'fulfilled' && Array.isArray(assignmentsRes.value.data) ? assignmentsRes.value.data : [];
            const staffData = staffRes.status === 'fulfilled' && Array.isArray(staffRes.value.data) ? staffRes.value.data : [];

            setMetrics({
                totalAssets: assetsData.length,
                assignedCount: assignmentsData.length,
                availableStock: assetsData.length - assignmentsData.length,
                pendingCount: assetsData.filter(a => {
                    const status = String(a.assetStatus || '').toLowerCase();
                    return ['scrap', 'repair', 'maintenance', 'under repair'].includes(status);
                }).length,
                totalStaff: staffData.length, 
                distribution: [
                    { name: "Narsinghgarh Factory", count: assetsData.filter(a => a.location && a.location.toLowerCase().includes('narsinghgarh')).length },
                    { name: "Jhansi Operations", count: assetsData.filter(a => a.location && a.location.toLowerCase().includes('jhansi')).length },
                    { name: "Damoh Unit", count: assetsData.filter(a => a.location && a.location.toLowerCase().includes('damoh')).length }
                ]
            });
        } catch (error) {
            console.error('Metrics failed to reload:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setTimeout(() => {
                isFetchingRef.current = false;
            }, 1200);
        }
    };

    const fetchExplicitFilteredAssets = async (updatedFilters) => {
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(updatedFilters).filter(([_, value]) => String(value).trim() !== "")
            );
            const queryString = new URLSearchParams(activeFilters).toString();
            const res = await axios.get(`http://localhost:5000/api/admin/assets-search?${queryString}`);
            setAssets(res.data);
            setHasActiveFilter(true);
        } catch (err) {
            console.error("Network synchronization fault:", err);
        }
    };

    const fetchFilteredAssets = async () => {
        await fetchExplicitFilteredAssets(filters);
    };

    const handleResetAndReloadTable = async () => {
        setFilters(initialFilters);
        setAssets([]);
        setHasActiveFilter(false);
        setExpandedRow(null);
        
        if (!isFetchingRef.current) {
            await fetchLiveSystemData();
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        fetchFilteredAssets();
    };

    const handleRemoveAsset = async (e, id, assetLabel) => {
        e.stopPropagation(); 

        if (!window.confirm(`Are you sure you want to permanently delete asset [${assetLabel}] from the Dashboard and Atlas DB?`)) {
            return;
        }

        const securityChallenge = window.prompt("⚠️ SECURITY AUTH REQUIRED:\nPlease input the Admin Password to authorize this deletion:");
        if (!securityChallenge) return;

        if (securityChallenge !== "HCIL2026") {
            alert("❌ Access Denied: Invalid Security Signature.");
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:5000/api/assets/${id}`);
            if (response.status === 200 || response.data.success) {
                alert("Asset successfully flushed from ecosystem.");
                setAssets(prev => prev.filter(item => item._id !== id));
                isFetchingRef.current = false; 
                fetchLiveSystemData(); 
            }
        } catch (err) {
            console.error("❌ Failed to process removal:", err);
            alert(err.response?.data?.error || "Error removing asset from data cluster.");
        }
    };

    const toggleRowDetails = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const triggerHiddenFileInputNode = () => {
        const fileInputNode = document.getElementById('masterPortalSpreadsheetFileInput');
        if (fileInputNode) fileInputNode.click();
    };

    const handleMasterCSVUploadPortal = async (event) => {
        const fileSelected = event.target.files[0];
        if (!fileSelected) return;

        if (!fileSelected.name.endsWith('.csv')) {
            alert("File configuration mismatch: Please drop a standard (.csv) format file.");
            return;
        }

        if (window.confirm(`Are you sure you want to drop all database rows and upload master sheet [${fileSelected.name}]? This updates active assignments simultaneously.`)) {
            try {
                setSyncing(true);
                const multipartFormData = new FormData();
                multipartFormData.append('file', fileSelected);

                const res = await axios.post("http://localhost:5000/api/assets/upload-csv", multipartFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data.success) {
                    alert(res.data.message || "Database updated cleanly!");
                    handleResetAndReloadTable(); 
                }
            } catch (err) {
                console.error("Master upload thread broke:", err);
                alert(err.response?.data?.error || "Ecosystem network handshake timeout.");
            } finally {
                setSyncing(false);
                event.target.value = ""; 
            }
        }
    };

    const executeCSVDownloadPipeline = (dataPool, outputFilename) => {
        const csvStructuralHeaders = [
            'assetId', 'assetStatus', 'assignedToName', 'employeeType', 'serviceTag', 'barcode',
            'make', 'hardwareModelNo', 'hostname', 'sccm', 'operatingSystem', 'invoiceNo', 
            'capitalisedAt', 'capitalisedYear', 'poNo', 'location', 'department'
        ];

        let serializedContent = csvStructuralHeaders.join(",") + "\n";

        dataPool.forEach(record => {
            const rowFields = csvStructuralHeaders.map(header => {
                const rawFieldData = record[header] !== undefined && record[header] !== null ? record[header] : '';
                const formatString = String(rawFieldData).replace(/"/g, '""'); 
                return formatString.includes(',') ? `"${formatString}"` : formatString;
            });
            serializedContent += rowFields.join(",") + "\n";
        });

        const dataBlob = new Blob([serializedContent], { type: 'text/csv;charset=utf-8;' });
        const temporaryLinkNode = document.createElement("a");
        const binaryObjectUrl = URL.createObjectURL(dataBlob);
        
        temporaryLinkNode.setAttribute("href", binaryObjectUrl);
        temporaryLinkNode.setAttribute("download", outputFilename);
        temporaryLinkNode.style.visibility = 'hidden';
        document.body.appendChild(temporaryLinkNode);
        temporaryLinkNode.click();
        document.body.removeChild(temporaryLinkNode);
    };

    const downloadFilteredAssets = () => {
        if (!assets || assets.length === 0) {
            alert("Export Error: The current filtered views contain zero ledger rows.");
            return;
        }
        executeCSVDownloadPipeline(assets, "Filtered_IT_Asset_Inventory.csv");
    };

    const downloadFullMasterDatabase = async () => {
        try {
            setRefreshing(true);
            const response = await axios.get('http://localhost:5000/api/admin/assets-search');
            if (response.data && Array.isArray(response.data)) {
                executeCSVDownloadPipeline(response.data, "Full_Master_IT_Asset_Database.csv");
            }
        } catch (err) {
            console.error("Failed to compile cloud master document download:", err);
            alert("Network timeout or permission rejection generating master spreadsheet.");
        } finally {
            setRefreshing(false);
        }
    };

    const assignedPercentage = metrics.totalAssets > 0 ? Math.round((metrics.assignedCount / metrics.totalAssets) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-slate-200 antialiased font-sans pb-20">
            
            {/* Header Banner Section */}
            <div className="bg-[#111827]/40 border-b border-slate-800/60 pt-10 pb-24 px-8 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_45%)]"></div>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live Inventory Hub</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mt-3">IT Inventory Dashboard</h1>
                        <p className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wider">HeidelbergCement India Operations</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={handleResetAndReloadTable} disabled={refreshing} className="p-3 bg-[#161f30] hover:bg-[#1e2a42] text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all active:scale-95" title="Reset Filters & Reload Data">
                            <RefreshCw className={`w-4 h-4 ${refreshing || syncing ? 'animate-spin' : ''}`} />
                        </button>

                        <button onClick={downloadFullMasterDatabase} disabled={refreshing} className="inline-flex items-center px-4 py-3 bg-[#161f30] border border-slate-800 hover:bg-[#1e2a42] text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
                            <Download className="w-3.5 h-3.5 mr-2 text-blue-400" />
                            Export Full DB
                        </button>

                        {hasAppliedFilter && (
                            <button onClick={downloadFilteredAssets} className="inline-flex items-center px-4 py-3 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
                                <Download className="w-3.5 h-3.5 mr-2 text-blue-400" />
                                Export Filtered ({assets.length})
                            </button>
                        )}

                        <div className="relative">
                            <input 
                                type="file" 
                                id="masterPortalSpreadsheetFileInput" 
                                accept=".csv" 
                                onChange={handleMasterCSVUploadPortal} 
                                className="hidden" 
                                disabled={syncing}
                            />
                            <button 
                                type="button"
                                onClick={triggerHiddenFileInputNode} 
                                disabled={syncing}
                                className="inline-flex items-center px-4 py-3 bg-[#161f30] border border-slate-800 hover:bg-[#1e2a42] text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                            >
                                {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Database className="w-3.5 h-3.5 mr-2 text-emerald-400" />}
                                Upload Master CSV
                            </button>
                        </div>

                        <Link to="/asset-inventory" className="inline-flex items-center px-5 py-3 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95">
                            <Plus className="w-4 h-4 mr-1" /> Add Asset
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metrics Widgets */}
            <div className="max-w-7xl mx-auto px-8 -mt-14 relative z-20 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-[#111827] rounded-xl p-5 border border-slate-800 shadow-xl flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Equipment</span>
                            <h3 className="text-3xl font-black text-white tracking-tight">{metrics.totalAssets}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Laptop className="w-5 h-5" /></div>
                    </div>

                    <div className="bg-[#111827] rounded-xl p-5 border border-slate-800 shadow-xl flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Assigned Devices</span>
                            <div className="flex items-baseline space-x-2">
                                <h3 className="text-3xl font-black text-white tracking-tight">{metrics.assignedCount}</h3>
                                <span className="text-xs font-bold font-mono text-emerald-400">({assignedPercentage}%)</span>
                            </div>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><BarChart2 className="w-5 h-5" /></div>
                    </div>

                    <div className="bg-[#111827] rounded-xl p-5 border border-slate-800 shadow-xl flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Staff</span>
                            <h3 className="text-3xl font-black text-white tracking-tight">{metrics.totalStaff}</h3>
                        </div>
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl"><Users className="w-5 h-5" /></div>
                    </div>

                    <div 
                        onClick={() => {
                            const updatedFilters = { ...initialFilters, assetStatus: 'Maintenance' };
                            setFilters(updatedFilters);
                            setHasActiveFilter(true);
                            fetchExplicitFilteredAssets(updatedFilters); 
                        }}
                        className="bg-[#111827] rounded-xl p-5 border border-slate-800 hover:border-amber-500/40 shadow-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
                    >
                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 group-hover:text-amber-400 transition-colors font-medium uppercase tracking-wider">Action Needed / Repair</span>
                            <h3 className="text-3xl font-black text-amber-400 tracking-tight">{metrics.pendingCount}</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-105 transition-transform">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filter Matrix Controls - Optimized Clean 2-Row Grid */}
                <div className="bg-[#111827] p-5 border border-slate-800 rounded-xl shadow-2xl">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        
                        {/* ROW 1 - POSITION 1 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center"><Search className="w-3 h-3 mr-1 text-slate-500" /> Search Records</label>
                            <input type="text" name="search" placeholder="Type keyword..." value={filters.search} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 placeholder-slate-700 rounded-lg p-3 outline-none focus:border-emerald-500/30" />
                        </div>

                        {/* ROW 1 - POSITION 2 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Plant Hub</label>
                            <select name="location" value={filters.location} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-lg p-3 outline-none focus:border-emerald-500/30 cursor-pointer appearance-none">
                                <option value="">Select Region...</option>
                                <option value="Narsinghgarh Factory">Narsinghgarh</option>
                                <option value="Damoh Unit">Damoh</option>
                                <option value="Jhansi Operations">Jhansi</option>
                            </select>
                        </div>

                        {/* ROW 1 - POSITION 3 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Department</label>
                            <select name="department" value={filters.department} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-lg p-3 outline-none focus:border-emerald-500/30 cursor-pointer appearance-none">
                                <option value="">Select Sector...</option>
                                <option value="IT Department">IT Department</option>
                                <option value="Mining Logistics">Mining Logistics</option>
                                <option value="Operations Sector">Operations Sector</option>
                                <option value="Human Resources">Human Resources</option>
                            </select>
                        </div>

                        {/* ROW 1 - POSITION 4 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Asset Category</label>
                            <select name="assetType" value={filters.assetType} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-lg p-3 outline-none focus:border-emerald-500/30 cursor-pointer appearance-none">
                                <option value="">Select Category...</option>
                                <option value="Laptop">Laptops</option>
                                <option value="Desktop">Desktop Towers</option>
                                <option value="Tab">Tablets</option>
                                <option value="Projector">Projectors</option>
                                <option value="Printer">Printers</option>
                                <option value="UPS">UPS Systems</option>
                            </select>
                        </div>

                        {/* ROW 1 - POSITION 5 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Current Status</label>
                            <select name="assetStatus" value={filters.assetStatus} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-lg p-3 outline-none focus:border-emerald-500/30 cursor-pointer appearance-none">
                                <option value="">Select State...</option>
                                <option value="In Use">Active: In Use</option>
                                <option value="Available">Stockpile: Available</option>
                                <option value="Maintenance">Maintenance Facility</option>
                                <option value="Scrap">Scrap Inventory</option>
                                <option value="Sold">Sold Units</option>
                            </select>
                        </div>

                        {/* ROW 1 - POSITION 6 */}
                        <div className="space-y-1.5">
                            <button type="submit" className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:scale-95">
                                <Search className="w-4 h-4 mr-1" />
                                <span>Find Details</span>
                            </button>
                        </div>

                        {/* ROW 2 - POSITION 1 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">User Name</label>
                            <input type="text" name="assignedToName" placeholder="Filter by Name..." value={filters.assignedToName} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 placeholder-slate-700 rounded-lg p-3 outline-none focus:border-emerald-500/30" />
                        </div>

                        {/* ROW 2 - POSITION 2 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Service Tag</label>
                            <input type="text" name="serviceTag" placeholder="Tag reference..." value={filters.serviceTag} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 placeholder-slate-700 rounded-lg p-3 outline-none focus:border-emerald-500/30" />
                        </div>

                        {/* ROW 2 - POSITION 3 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Hardware Model</label>
                            <input type="text" name="hardwareModelNo" placeholder="e.g. EliteBook..." value={filters.hardwareModelNo} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 placeholder-slate-700 rounded-lg p-3 outline-none focus:border-emerald-500/30" />
                        </div>

                        {/* ROW 2 - POSITION 4 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">Invoice No</label>
                            <input type="text" name="invoiceNo" placeholder="Invoice reference..." value={filters.invoiceNo} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 placeholder-slate-700 rounded-lg p-3 outline-none focus:border-emerald-500/30" />
                        </div>

                        {/* ROW 2 - POSITION 5 */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider">PO Number</label>
                            <input type="text" name="poNo" placeholder="PO reference..." value={filters.poNo} onChange={handleFilterChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 placeholder-slate-700 rounded-lg p-3 outline-none focus:border-emerald-500/30" />
                        </div>

                        {/* ROW 2 - POSITION 6 */}
                        <div className="hidden md:block"></div>
                    </form>
                </div>

                {/* Data Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-[#111827] rounded-xl p-1 border border-slate-800/80 shadow-xl overflow-hidden">
                        
                        {!hasAppliedFilter ? (
                            <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                                <EyeOff className="w-8 h-8 text-slate-600" />
                                <h4 className="text-sm font-bold text-slate-400 font-sans tracking-wide">Ledger Locked</h4>
                                <p className="text-xs text-slate-500 max-w-sm font-sans leading-relaxed">
                                    Please choose a parameter value or hit "Find Details" to view matching master data configurations.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-4.5 border-b border-slate-800/80 flex items-center justify-between bg-[#141d2f]/40">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                                        Top Filtered Items Ledger (Showing {assets.slice(0, 10).length} of {assets.length})
                                    </h3>
                                    <button onClick={handleResetAndReloadTable} className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center">
                                        <RefreshCw className="w-3 h-3 mr-1" /> Reset View
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    {assets.length === 0 ? (
                                        <div className="p-12 text-center text-xs font-medium text-slate-500 font-mono">No matching records found.</div>
                                    ) : (
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-[#141d2f]/60 text-slate-400 font-semibold border-b border-slate-800/80 uppercase tracking-wider font-mono">
                                                    <th className="py-4 px-6">Asset Key</th>
                                                    <th className="py-4 px-6">Device Specifications</th>
                                                    <th className="py-4 px-6">Assigned To</th>
                                                    <th className="py-4 px-6 text-center">Status</th>
                                                    <th className="py-4 px-6 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono text-[12px]">
                                                {assets.slice(0, 10).map((asset, index) => {
                                                    const currentId = asset._id || index;
                                                    const isExpanded = expandedRow === currentId;
                                                    const assetLabel = asset.assetId || asset.serviceTag || 'Unknown Asset';

                                                    return (
                                                        <React.Fragment key={currentId}>
                                                            <tr onClick={() => toggleRowDetails(currentId)} className="hover:bg-[#162136]/30 transition-colors cursor-pointer group">
                                                                <td className="py-4 px-6 text-emerald-400 font-bold font-mono">
                                                                    <div>{assetLabel}</div>
                                                                    <span className="text-[10px] text-slate-500 font-sans tracking-wide block mt-1">
                                                                        {isExpanded ? '▼ Hide Specifications' : '▶ Show Full Details'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-6 font-sans text-sm text-slate-200">
                                                                    <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{asset.hardwareModelNo || asset.make || "General Hardware Unit"}</div>
                                                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">Type: {asset.assetType || 'N/A'} | OS: {asset.operatingSystem || 'N/A'}</div>
                                                                </td>
                                                                <td className="py-4 px-6 font-sans">
                                                                    <div className="text-xs text-slate-300 font-semibold">{asset.assignedToName || "Available In Stock"}</div>
                                                                    {asset.employeeId && <div className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {asset.employeeId}</div>}
                                                                </td>
                                                                <td className="py-4 px-6 text-center">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border 
                                                                        ${asset.assetStatus && asset.assetStatus.toLowerCase() === 'maintenance' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : asset.assetStatus && asset.assetStatus.toLowerCase() === 'in use' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-blue-500/5 text-blue-400 border-blue-500/10'}`}>
                                                                        {asset.assetStatus || 'Available'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-6 text-right">
                                                                    <div className="inline-flex items-center justify-end space-x-1">
                                                                        
                                                                        <button
                                                                            type="button"
                                                                            onClick={async (e) => {
                                                                                e.stopPropagation();
                                                                                
                                                                                if (asset.assetStatus === 'Maintenance') {
                                                                                    if (window.confirm(`Are you sure you want to change [${assetLabel}] status to Normal? This commits completion timestamps to log collections.`)) {
                                                                                        try {
                                                                                            const res = await axios.put(`http://localhost:5000/api/assets/${asset._id}/return-from-repair`);
                                                                                            if (res.data.success) {
                                                                                                alert("Lifecycle complete: Asset restored to normal stock pool.");
                                                                                                handleResetAndReloadTable();
                                                                                            }
                                                                                        } catch (err) {
                                                                                            alert("Handshake error reverting repair state.");
                                                                                        }
                                                                                    }
                                                                                } else {
                                                                                    setRepairForm({ vendorName: "", expectedReturnDate: "", expectedPrice: "" });
                                                                                    setRepairModal({ show: true, assetId: asset._id, label: assetLabel });
                                                                                }
                                                                            }}
                                                                            className={`p-2 rounded-xl transition-all ${asset.assetStatus === 'Maintenance' ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 animate-pulse' : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800/60'}`}
                                                                            title={asset.assetStatus === 'Maintenance' ? "Mark Maintenance as Complete (Normalize)" : "Send to Maintenance/Repair"}
                                                                        >
                                                                            🔧
                                                                        </button>

                                                                        <button 
                                                                            type="button"
                                                                            onClick={(e) => handleRemoveAsset(e, asset._id, assetLabel)}
                                                                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                                                            title="Permanently Delete Asset"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>

                                                            {isExpanded && (
                                                                <tr className="bg-slate-950/60 border-l-2 border-emerald-500">
                                                                    <td colSpan="5" className="p-6">
                                                                        <div className="flex flex-col space-y-6">
                                                                            
                                                                            {/* Master Core Specifications Sub-Grid */}
                                                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-slate-300 font-sans">
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Plant Hub:</span> <span className="font-semibold text-white">{asset.location || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Service Tag:</span> <span className="font-semibold font-mono text-emerald-300">{asset.serviceTag || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Invoice No:</span> <span className="font-semibold text-white">{asset.invoiceNo || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">PO Number:</span> <span className="font-semibold text-white">{asset.poNo || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Capitalised Year:</span> <span className="font-semibold text-white">{asset.capitalisedYear || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Hostname:</span> <span className="font-semibold text-white font-mono">{asset.hostname || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">SCCM Version:</span> <span className="font-semibold text-white">{asset.sccmStatus || asset.sccm || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Operating System:</span> <span className="font-semibold text-white">{asset.operatingSystem || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Barcode:</span> <span className="font-semibold text-white font-mono">{asset.barcode || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Corporate Email:</span> <span className="font-semibold text-slate-300 text-xs">{asset.emailAddress || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Department:</span> <span className="font-semibold text-white">{asset.department || '—'}</span></div>
                                                                                <div><span className="text-slate-500 block font-mono text-[10px] uppercase">Memory:</span> <span className="font-semibold text-white">{asset.memory || '—'}</span></div>
                                                                            </div>

                                                                            {/* 🎯 THE DYNAMIC WORKSHOP DETAILED MATRICES PANEL */}
                                                                            {asset.assetStatus && asset.assetStatus.toLowerCase() === 'maintenance' && (
                                                                                <div className="bg-[#1e293b]/40 border border-amber-500/20 p-4 rounded-xl space-y-3 max-w-3xl animate-fadeIn">
                                                                                    <div className="flex items-center space-x-2 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                                                                                        <span>🔧 Third-Party Maintenance Logistics Ledger</span>
                                                                                    </div>
                                                                                    
                                                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans text-slate-300">
                                                                                        <div>
                                                                                            <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wide">Assigned Vendor:</span>
                                                                                            <span className="font-bold text-white text-[13px]">{asset.maintenanceDetails?.vendorName || 'xyz'}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wide">Repair Estimate:</span>
                                                                                            <span className="font-bold text-emerald-400 font-mono text-[13px]">
                                                                                                ₹{asset.maintenanceDetails?.expectedPrice ? asset.maintenanceDetails.expectedPrice.toLocaleString('en-IN') : '0'}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wide">Dispatched On:</span>
                                                                                            <span className="font-medium text-slate-300 font-mono">
                                                                                                📅 {asset.repairDate ? new Date(asset.repairDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                                                            </span>
                                                                                            <span className="font-medium text-slate-500 font-mono text-[10px] block mt-0.5">
                                                                                                ⏰ {asset.repairDate ? new Date(asset.repairDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wide">Expected Return:</span>
                                                                                            <span className="font-bold text-amber-400 font-mono">
                                                                                                📅 {asset.maintenanceDetails?.expectedReturnDate ? new Date(asset.maintenanceDetails.expectedReturnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Side: Location Distribution Widget */}
                    <div className="lg:col-span-4 bg-[#111827] rounded-xl border border-slate-800/80 shadow-xl p-5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-5 pb-3 border-b border-slate-800/80 font-mono">Distribution by Location</h3>
                            <div className="space-y-3.5">
                                {metrics.distribution.map((loc, i) => (
                                    <div key={i} className="p-3.5 rounded-xl bg-[#141d2f]/30 border border-slate-800/60 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-[#162136] text-emerald-400 rounded-lg"><MapPin className="w-3.5 h-3.5" /></div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-200 font-sans">{loc.name}</h4>
                                                <span className="text-[10px] font-medium text-slate-500 font-mono">Units: {loc.count}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">
                            <Link to="/asset-inventory" className="py-2 rounded-lg hover:bg-[#162136] hover:text-emerald-400">Inventory</Link>
                            <Link to="/user-management" className="py-2 rounded-lg hover:bg-[#162136] hover:text-emerald-400">Staff</Link>
                            <Link to="/assigned-assets" className="py-2 rounded-lg hover:bg-[#162136] hover:text-emerald-400">Tracking</Link>
                            <Link to="/repair-history" className="py-2 rounded-lg hover:bg-[#162136] hover:text-emerald-400">Repair History</Link>
                        </div>
                    </div>
                </div>

            </div>

            {/* 🌟 INTERACTIVE POPUP MODAL: Captures Repair Vendor Constraints */}
            {repairModal.show && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
                    <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-scaleUp">
                        <div>
                            <h3 className="text-base font-black text-white flex items-center tracking-tight">🔧 Dispatch Asset to Repair</h3>
                            <p className="text-xs font-mono text-emerald-400 mt-0.5 uppercase tracking-wider">Device ID: {repairModal.label}</p>
                        </div>
                        
                        <div className="space-y-3.5 text-slate-300 text-xs font-medium">
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">Vendor Entity Name *</label>
                                <input type="text" placeholder="e.g. Apex Hardware Labs" value={repairForm.vendorName} onChange={(e) => setRepairForm({...repairForm, vendorName: e.target.value})} className="w-full bg-[#070b13] border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200 focus:border-emerald-500/30" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">Expected Date of Return</label>
                                <input type="date" value={repairForm.expectedReturnDate} onChange={(e) => setRepairForm({...repairForm, expectedReturnDate: e.target.value})} className="w-full bg-[#070b13] border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200 focus:border-emerald-500/30 font-mono" style={{ colorScheme: 'dark' }} />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">Expected Estimation Price (INR)</label>
                                <input type="number" placeholder="Cost allocation bounds..." value={repairForm.expectedPrice} onChange={(e) => setRepairForm({...repairForm, expectedPrice: e.target.value})} className="w-full bg-[#070b13] border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200 focus:border-emerald-500/30 font-mono" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-800/60">
                            <button type="button" onClick={() => setRepairModal({ show: false, assetId: null, label: "" })} className="px-4 py-2 bg-transparent text-slate-400 border border-slate-800 hover:text-white rounded-lg text-xs uppercase font-bold tracking-wider">Cancel</button>
                            <button type="button" 
                                onClick={async () => {
                                    if (!repairForm.vendorName.trim()) { alert("Validation Missing: You must input a vendor name."); return; }
                                    try {
                                        const res = await axios.post(`http://localhost:5000/api/assets/${repairModal.assetId}/send-to-repair`, repairForm);
                                        if (res.data.success) {
                                            alert("Asset routed into tracking schema history rows successfully.");
                                            setRepairModal({ show: false, assetId: null, label: "" });
                                            handleResetAndReloadTable();
                                        }
                                    } catch (err) { alert("Ingestion rejection compiling vendor details."); }
                                }}
                                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs uppercase font-bold tracking-wider shadow-lg"
                            >Confirm & Route</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;