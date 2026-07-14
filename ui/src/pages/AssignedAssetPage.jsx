import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Plus, User, HardDrive, Calendar, Edit2, Trash2, X, Link2, Building2, ChevronDown, Search, Layers, Filter, FileText, ShieldAlert } from 'lucide-react';

// Premium Modern Dropdown Component
const ModernSelect = ({ label, icon: Icon, options = [], value, onChange, placeholder, disabled, hintText }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const safeOptions = Array.isArray(options) ? options : [];

    const filteredOptions = safeOptions.filter(opt => {
        if (!opt) return false;
        if (typeof opt === 'string') {
            return opt.toLowerCase().includes(search.toLowerCase());
        }
        const labelText = String(opt.label || '');
        const sublabelText = String(opt.sublabel || '');
        return `${labelText} ${sublabelText}`.toLowerCase().includes(search.toLowerCase());
    });

    const selectedOption = safeOptions.find(opt => {
        if (!opt) return false;
        const optValue = typeof opt === 'string' ? opt : opt.value;
        return String(optValue) === String(value);
    });
    
    const displayValue = selectedOption 
        ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label) 
        : placeholder;

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="flex items-center space-x-2 text-xs font-semibold tracking-wide text-slate-400">
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{label}</span>
            </label>
            
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-slate-900/60 border text-sm rounded-xl py-3 px-4 outline-none transition-all duration-200 backdrop-blur-sm
                    ${disabled 
                        ? 'border-slate-800/40 text-slate-600 cursor-not-allowed bg-slate-950/40' 
                        : 'border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900/90 focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10'}`}
            >
                <span className={!value ? 'text-slate-500' : 'text-slate-200'}>
                    {disabled && hintText ? hintText : displayValue}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-[#0e1426] border border-slate-800/90 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md">
                    <div className="p-2 border-b border-slate-800 bg-slate-950/60 flex items-center space-x-2">
                        <Search className="w-4 h-4 text-slate-500 ml-2" />
                        <input
                            type="text"
                            placeholder="Search details..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent text-sm py-2 px-1 text-slate-200 outline-none placeholder-slate-600"
                            autoFocus
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <li className="text-center py-4 text-sm text-slate-500">No results found</li>
                        ) : (
                            filteredOptions.map((opt, i) => {
                                const val = typeof opt === 'string' ? opt : opt.value;
                                const lbl = typeof opt === 'string' ? opt : opt.label;
                                const sub = typeof opt === 'string' ? null : opt.sublabel;
                                return (
                                    <li key={i}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onChange(val);
                                                setIsOpen(false);
                                                setSearch('');
                                            }}
                                            className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 flex flex-col gap-0.5
                                                ${value === val 
                                                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500 pl-2.5' 
                                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                                        >
                                            <span className="font-medium">{lbl}</span>
                                            {sub && <span className="text-xs text-slate-500 font-mono tracking-tight">{sub}</span>}
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

const AssignedAssets = () => {
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [assignedAssets, setAssignedAssets] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null);
    
    // Core layout processing modes states
    const [assignmentType, setAssignmentType] = useState('USER'); 
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [userId, setUserId] = useState('');
    const [assetId, setAssetId] = useState('');
    const [assignmentDate, setAssignmentDate] = useState(getTodayDateString());
    const [serviceRequestNo, setServiceRequestNo] = useState('');

    const [departments, setDepartments] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [assets, setAssets] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    // LIVE FILTER RUNTIME ENGINE
    useEffect(() => {
        const result = assignedAssets.filter(item => {
            const assigneeName = item.assignedToName || '';
            const employeeId = item.userId || '';
            const allocatedAssetId = item.assetId || '';
            const hardwareName = item.assetName || '';
            const deviceType = item.assetType || '';
            const ticketNo = item.serviceRequestNo || ''; 

            const matchesType = typeFilter === '' || deviceType.toLowerCase() === typeFilter.toLowerCase();
            const matchesText = `${assigneeName} ${employeeId} ${allocatedAssetId} ${hardwareName} ${ticketNo}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            return matchesType && matchesText;
        });
        setFilteredAssignments(result);
    }, [searchQuery, typeFilter, assignedAssets]);

    useEffect(() => {
        if (assignmentType === 'USER' && selectedDepartment && selectedDepartment !== "") {
            fetchEmployeesByDepartment(selectedDepartment);
        } else {
            setFilteredEmployees([]);
            if (!editMode && assignmentType === 'USER') setUserId('');
        }
    }, [selectedDepartment, editMode, assignmentType]);

    const fetchInitialData = async () => {
        try {
            const deptsRes = await axios.get('/api/admin/assets-search');
            if (deptsRes.data && Array.isArray(deptsRes.data)) {
                const clearSectorsList = [...new Set(deptsRes.data.map(a => a.department).filter(Boolean))];
                setDepartments(clearSectorsList.length > 0 ? clearSectorsList : ["IT Department", "Mining Logistics", "Human Resources", "Operations Sector"]);
            }
        } catch (error) { console.error('❌ Failed to load departments:', error); }

        try {
            const assetsRes = await axios.get('/api/admin/assets-search');
            if (assetsRes.data) setAssets(assetsRes.data);
        } catch (error) { console.error('❌ Failed to load assets:', error); }

        try {
            const assignmentsRes = await axios.get('/api/assignments');
            if (assignmentsRes.data) {
                setAssignedAssets(assignmentsRes.data);
                setFilteredAssignments(assignmentsRes.data);
            }
        } catch (error) { console.error('❌ Failed to load assignments:', error); }
    };

    const fetchEmployeesByDepartment = async (deptName) => {
        try {
            const response = await axios.get('/api/admin/employees');
            if (response.data && Array.isArray(response.data)) {
                const sectorMatches = response.data.filter(emp => emp.department && emp.department.toLowerCase().trim() === deptName.toLowerCase().trim());
                setFilteredEmployees(sectorMatches);
            }
        } catch (error) { console.error('❌ Failed to load employees:', error); }
    };

    // 🌟 ANTI-TAMPER SECURITY GATEWAY VALIDATOR
    const verifySecurityPrivileges = () => {
        const adminChallenge = window.prompt("⚠️ SECURITY AUTH REQUIRED:\nPlease input your System Password to unlock mutations:");
        if (!adminChallenge) return false;
        if (adminChallenge === "HCIL2026") {
            return true;
        } else {
            alert("❌ Access Denied: Invalid Security Signature.");
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const finalUserId = assignmentType === 'STOCK' ? 'IN_STOCK' : userId;
        if (!finalUserId || !assetId) {
            alert("Please ensure all fields are specified before confirmation.");
            return;
        }

        try {
            const payload = { userId: finalUserId, assetId, assignmentDate, serviceRequestNo: serviceRequestNo.trim() };
            await axios.post('/api/assignments', payload);
            setModalOpen(false);
            resetForm();
            fetchInitialData();
        } catch (error) { 
            console.error('❌ Error saving assignment:', error); 
            alert(error.response?.data?.error || "Failed to finalize asset tracking allocation row.");
        }
    };

    const handleEdit = (assignment) => {
        // 🛡️ Challenge prompt interceptor blocks layout tampering actions
        if (!verifySecurityPrivileges()) return;

        setCurrentAssignment(assignment);
        const isStock = assignment.userId === 'IN_STOCK';
        setAssignmentType(isStock ? 'STOCK' : 'USER');
        setUserId(assignment.userId);
        setAssetId(assignment.assetId);
        setServiceRequestNo(assignment.serviceRequestNo || ''); 
        setAssignmentDate(new Date(assignment.assignmentDate).toISOString().split('T')[0]);
        setEditMode(true);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        // 🛡️ Challenge prompt interceptor blocks deletion actions
        if (!verifySecurityPrivileges()) return;

        if (window.confirm('Are you sure you want to permanently clear this allocation record?')) {
            try {
                await axios.delete(`/api/assignments/${id}`);
                setAssignedAssets(prev => prev.filter(a => a._id !== id));
                fetchInitialData();
            } catch (error) { console.error('❌ Error deleting assignment:', error); }
        }
    };

    const resetForm = () => {
        setAssignmentType('USER');
        setSelectedDepartment('');
        setUserId('');
        setAssetId('');
        setServiceRequestNo(''); 
        setAssignmentDate(getTodayDateString()); 
        setEditMode(false);
        setCurrentAssignment(null);
    };

    const departmentOptions = departments.map(d => typeof d === 'string' ? d : d.label || 'Sector');
    
    const employeeOptions = filteredEmployees.map(emp => ({
        value: emp.userId,
        label: `${emp.firstName} ${emp.lastName || ''}`,
        sublabel: `Employee ID: ${emp.userId}`
    }));

    const assetOptions = assets
        .filter(asset => assignmentType === 'STOCK' ? asset.assetStatus === 'In Use' : asset.assetStatus === 'Available')
        .map(asset => ({
            value: asset.assetId,
            label: `${asset.hardwareModelNo || asset.make || 'Corporate Unit'} (${asset.assetId})`,
            sublabel: `Service Tag: ${asset.serviceTag || '—'}`
        }));

    return (
        <div className="bg-[#0b0f19] rounded-2xl border border-slate-800/60 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-slate-300">
            
            {/* Table Control Header Banner */}
            <div className="p-6 border-b border-slate-800/80 bg-slate-900/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                        <Link2 className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-100 tracking-tight">
                            Asset Assignments Logs
                        </h3>
                    </div>
                </div>

                <button
                    onClick={() => { resetForm(); setModalOpen(true); }}
                    className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(16,185,129,0.25)] active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Assignment</span>
                </button>
            </div>

            {/* LIVE INTERACTIVE FILTER ROW */}
            <div className="p-4 bg-[#111827]/40 border-b border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search assignee name, ID, or asset..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500/30 transition-colors"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500/30 cursor-pointer appearance-none"
                    >
                        <option value="">All Hardware Categories</option>
                        <option value="Laptop">Laptops</option>
                        <option value="Desktop">Desktop Towers</option>
                        <option value="Tab">Tablets</option>
                        <option value="Projector">Projectors</option>
                        <option value="Printer">Printers</option>
                        <option value="UPS">UPS Systems</option>
                    </select>
                </div>
                
                <div className="flex items-center justify-end text-xs font-mono text-slate-500 px-2">
                    Found {filteredAssignments.length} matching rows
                </div>
            </div>

            {/* Assignments Ledger Table */}
            <div className="overflow-x-auto">
                {filteredAssignments.length === 0 ? (
                    <div className="p-16 text-center text-sm font-medium text-slate-500 font-sans tracking-wide">
                        No active assignments discovered matching active selection rules.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-950/40 text-slate-400 font-semibold border-b border-slate-800/60 font-mono text-xs uppercase tracking-wider">
                                <th className="py-4 px-6" style={{ width: '28%' }}>Assignee Employee Details</th>
                                <th className="py-4 px-6" style={{ width: '28%' }}>Device Information Details</th>
                                {/* 🌟 NEW COLUMN HEADER SLOT ADDED */}
                                <th className="py-4 px-6" style={{ width: '20%' }}>Service Request No</th> 
                                <th className="py-4 px-6" style={{ width: '14%' }}>Date Assigned</th>
                                <th className="py-4 px-6 text-right" style={{ width: '10%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-slate-300">
                            {filteredAssignments.map((assignment) => {
                                const isStockRow = assignment.userId === 'IN_STOCK';
                                return (
                                    <tr key={assignment._id} className="hover:bg-slate-900/30 transition-colors duration-150 group">
                                        <td className="py-4 px-6 font-sans">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-2 h-2 rounded-full shrink-0 shadow-lg ${isStockRow ? 'bg-blue-400 shadow-blue-400/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}></div>
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                        {isStockRow ? "📥 Returned to Stock" : (assignment.assignedToName || "Corporate Employee")}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                        {isStockRow ? "Location: Central Storage Room" : `ID: ${assignment.userId}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-sans">
                                            <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                                                {assignment.assetName || "Corporate Laptop / Device"}
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                Serial Reference ID: <span className="text-emerald-400 font-semibold">{assignment.assetId}</span>
                                            </div>
                                        </td>
                                        
                                        {/* 🌟 NEW COLUMN DATA RENDERING FIELD */}
                                        <td className="py-4 px-6 font-mono text-xs">
                                            {assignment.serviceRequestNo ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 border border-slate-800/80 text-blue-400 font-bold tracking-wide uppercase">
                                                    🎫 {assignment.serviceRequestNo}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 tracking-wide font-sans text-xs">Not Specified</span>
                                            )}
                                        </td>

                                        <td className="py-4 px-6 text-slate-400 font-mono text-xs">
                                            {assignment.assignmentDate ? new Date(assignment.assignmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="inline-flex items-center justify-end space-x-1">
                                                <button onClick={() => handleEdit(assignment)} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all" title="Edit Log Row">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(assignment._id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete Log Row">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Premium Glassmorphism Form Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 transition-all duration-300">
                    <div className="bg-[#0b0f19] border border-slate-800 shadow-[0_30px_80px_rgba(0,0,0,0.8)] w-full max-w-md rounded-2xl overflow-hidden relative transform transition-all duration-300 animate-in fade-in zoom-in-95">
                        
                        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none15 rounded-bl-full"></div>
                        
                        <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/20 relative z-10">
                            <h4 className="text-base font-semibold text-slate-100 flex items-center gap-2.5 tracking-tight">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></div>
                                {editMode ? 'Modify Hardware Allocation Log' : 'Asset Assignment & Return'}
                            </h4>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 relative z-10">
                            
                            {/* STEP 1: Assignment Category Allocation Type Router Switch Dropdown */}
                            <ModernSelect 
                                label="Step 1: Choose Assignment Allocation Type" 
                                icon={Layers}
                                options={[
                                    { value: 'USER', label: '👥 Assign to Active User Profile', sublabel: 'Maps hardware to an individual employee' },
                                    { value: 'STOCK', label: '📥 Return Asset to In-Stock Storage', sublabel: 'Clears user mapping and logs device to warehouse' }
                                ]} 
                                value={assignmentType} 
                                onChange={(val) => {
                                    setAssignmentType(val);
                                    if (val === 'STOCK') {
                                        setUserId('IN_STOCK');
                                        setSelectedDepartment('');
                                    } else {
                                        setUserId('');
                                    }
                                }}
                                placeholder="Select allocation protocol..." 
                                disabled={editMode}
                            />

                            {/* CONDITIONAL COMPONENT PROFILE INTERACTIVE FORM FIELDS */}
                            {assignmentType === 'USER' ? (
                                <>
                                    <ModernSelect 
                                        label="Step 2: Select Corporate Department" 
                                        icon={Building2}
                                        options={departmentOptions} 
                                        value={selectedDepartment} 
                                        onChange={setSelectedDepartment}
                                        placeholder="Choose a department" 
                                        disabled={editMode}
                                    />

                                    <ModernSelect 
                                        label="Step 3: Select Assignee Employee" 
                                        icon={User}
                                        options={employeeOptions} 
                                        value={userId} 
                                        onChange={setUserId}
                                        placeholder="Choose an employee profile..." 
                                        disabled={(!selectedDepartment || selectedDepartment === "") && !editMode}
                                        hintText="Please select a department first"
                                    />
                                </>
                            ) : (
                                <div className="p-3.5 bg-blue-500/5 border border-blue-500/10 text-slate-400 text-xs rounded-xl flex items-start gap-2.5 animate-fadeIn">
                                    <span className="text-base text-blue-400">ℹ️</span>
                                    <div>
                                        <span className="text-blue-400 font-bold block mb-0.5">In-Stock Storage Routine Engaged</span>
                                        This asset will be unassigned from active staff tracking loops. A storage allocation receipt will be automatically sent to the dedicated management email address.
                                    </div>
                                </div>
                            )}

                            {/* STEP 4/2: Hardware Selection Asset Ingest slot */}
                            <ModernSelect 
                                label={assignmentType === 'STOCK' ? "Step 2: Select Device to Check In" : "Step 4: Select Target Asset"} 
                                icon={HardDrive}
                                options={assetOptions} 
                                value={assetId} 
                                onChange={setAssetId}
                                placeholder="Choose hardware reference ID..."
                            />

                            {/* STEP 5/3: Service Request Number (SRN) Tracking Input Field */}
                            <div className="space-y-2">
                                <label htmlFor="serviceRequestNo" className="flex items-center space-x-2 text-xs font-semibold tracking-wide text-slate-400">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <span>{assignmentType === 'STOCK' ? "Step 3: Return Service Request No (Optional)" : "Step 5: Assignment Service Request No (Optional)"}</span>
                                </label>
                                <input
                                    id="serviceRequestNo"
                                    name="serviceRequestNo"
                                    type="text"
                                    placeholder="e.g. SRN-2026-9843..."
                                    className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-700 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-700 transition-all duration-200 backdrop-blur-sm shadow-inner font-mono"
                                    value={serviceRequestNo}
                                    onChange={(e) => setServiceRequestNo(e.target.value)}
                                />
                            </div>

                            {/* STEP 6/4: Calendar Timestamp Picker */}
                            <div className="space-y-2">
                                <label htmlFor="assignmentDate" className="flex items-center space-x-2 text-xs font-semibold tracking-wide text-slate-400">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <span>{assignmentType === 'STOCK' ? "Step 4: Return Effective Date" : "Step 6: Assignment Activation Date"}</span>
                                </label>
                                <input
                                    id="assignmentDate" 
                                    name="assignmentDate" 
                                    type="date"
                                    className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-700 transition-all duration-200 backdrop-blur-sm"
                                    value={assignmentDate} 
                                    onChange={(e) => setAssignmentDate(e.target.value)} 
                                    required
                                />
                            </div>

                            {/* Action Modal Control Buttons Panel */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/60 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setModalOpen(false)} 
                                    className="px-4 py-2.5 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-sm font-medium rounded-xl border border-slate-800/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={`px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98] 
                                        ${assignmentType === 'STOCK' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10'}`}
                                >
                                    {editMode ? 'Save Changes' : (assignmentType === 'STOCK' ? 'Confirm Return' : 'Confirm Assignment')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignedAssets;