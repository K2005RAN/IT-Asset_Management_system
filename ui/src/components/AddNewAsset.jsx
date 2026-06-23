import React, { useState } from 'react';
import axios from 'axios';
import { HardDrive, Save, ArrowLeft, X, Layers, ShieldCheck, ClipboardCheck, BadgePercent, ChevronDown } from 'lucide-react';

const AddNewAsset = () => {
    // 🌟 COMPLETE STRUCTURAL FIELD DIRECTORY: Maps 1:1 against your master spreadsheet column keys
    const [assetData, setAssetData] = useState({
        'Sno': '',
        'Plant': 'Narsinghgarh',
        'User Name': '',
        'First Name': '',
        'Last Name': '',
        'Employee ID': '',
        'User Type': 'employee',
        'Domain ID': '',
        'Email Address': '',
        'Title': '',
        'Department': '',
        'Date of Joining': '',
        'Training Date': '',
        'Domain ID Create Date': '',
        'Asset Type': 'Laptop',
        'Asset Status': 'Available',
        'SDE Ref#': '',
        'Date of Assignment': '',
        'TC Migrated Date': '',
        'Mac Address': '',
        'Received From (Pla': '',
        'Employee Type': '',
        'Service Tag': '',
        'Barcode': '',
        'Make': '',
        'Hardware Model N': '',
        'Hostname': '',
        'SCCM': 'Unverified',
        'Operating System': 'Windows 11 Pro',
        'Asset No': '',
        'Manufacturer': '',
        'Memory': '',
        'Processor': '',
        'Invoice No': '',
        'Invoice Date': '',
        'Qty of Invoice': '1',
        'Invoice Value': '',
        'Capitalised at': '',
        'Capatilised Year': '',
        'W11 Compatible': 'Yes',
        'Approved Date for Procurement': '',
        'Adapter / Charger Serial no': '',
        'PO No': '',
        'PO Date': '',
        'HDD Specifications': '',
        'Warranty Start Date': '',
        'Warranty End Date': '',
        'AFE No': '',
        'Procured / Replace': 'Procured',
        'Procured / Replace Remarks': '',
        'SAP': '',
        'Migrated Production Users': '',
        'Proposed Production Users': '',
        'One drive data': '',
        'Outlook online data': '',
        'Outlook archive data': '',
        'Plan to replace in Y r1': '',
        'Repalcement/ New HP Eye Ease24inch Date': '',
        'New Dell LCD': '',
        'Keyboard Serial no': '',
        'Mouse serial no': '',
        'Physical Verification Status': 'Verified',
        // 🌟 ADDED COMPLIANCE KEY MATRIX SYNC
        'isCompliant': 'Under Review' 
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setAssetData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Unique document verification lock check
        if (!assetData['Asset No'] && !assetData['Service Tag']) {
            alert('Form Mismatch validation: You must specify an Asset No or Service Tag parameter field.');
            return;
        }

        try {
            const indexKeyFallback = assetData['Asset No'] || assetData['Service Tag'];
            const productionReadyPayload = {
                ...assetData,
                assetId: indexKeyFallback
            };

            const response = await axios.post('http://localhost:5000/api/assets', productionReadyPayload);

            if (response.status === 200 || response.status === 201) {
                alert('Pristine Document Registry Safe: Asset created and synchronized inside Atlas server layers.');
                window.location.href = '/asset-inventory';
            }
        } catch (error) {
            console.error('Core form registry trace failure:', error);
            alert(error.response?.data?.error || 'Database rejected object parsing formatting rules.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-slate-200 antialiased font-sans p-4 md:p-8 flex flex-col items-center pb-24">
            <div className="w-full max-w-6xl bg-[#111827] border border-slate-800 shadow-[0_32px_64px_rgba(0,0,0,0.7)] rounded-2xl overflow-hidden relative">
                
                {/* Visual Glow Decorations */}
                <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 h-64 w-64 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-tr-full pointer-events-none"></div>

                {/* Header Context Section */}
                <div className="px-8 py-6 border-b border-slate-800/80 bg-slate-900/20 flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                            <HardDrive className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-white">Register Asset</h3>
                            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">HeidelbergCement Managed Portal</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => window.location.href = '/asset-inventory'} className="text-slate-500 hover:text-slate-300 p-2 hover:bg-slate-800/50 rounded-xl transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-10">
                    
                    {/* SECTION 1: IDENTITY ACCESS METRICS */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                            <Layers className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">1. User Identity & Alignment Mapping</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Sno (Sequence Row)</label>
                                <input type="number" name="Sno" placeholder="Row reference..." value={assetData['Sno']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">User Name (Full Profile)</label>
                                <input type="text" name="User Name" placeholder="Full Name..." value={assetData['User Name']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">First Name</label>
                                <input type="text" name="First Name" value={assetData['First Name']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Last Name</label>
                                <input type="text" name="Last Name" value={assetData['Last Name']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Employee ID Reference</label>
                                <input type="text" name="Employee ID" placeholder="e.g. 21101019" value={assetData['Employee ID']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">User Type Status</label>
                                <input type="text" name="User Type" value={assetData['User Type']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Domain ID Code</label>
                                <input type="text" name="Domain ID" placeholder="Domain identifier..." value={assetData['Domain ID']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Email Address</label>
                                <input type="email" name="Email Address" placeholder="name@heidelbergcement.in" value={assetData['Email Address']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: OPERATIONAL DIVISION */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">2. Operational & Placement Parameters</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Plant Hub Placement</label>
                                <select name="Plant" value={assetData['Plant']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-500/30">
                                    <option value="Narsinghgarh">Narsinghgarh Plant</option>
                                    <option value="Damoh">Damoh Unit</option>
                                    <option value="Jhansi">Jhansi Operations</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Department</label>
                                <input type="text" name="Department" placeholder="e.g. Mining Logistics" value={assetData['Department']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Employee Title / Role</label>
                                <input type="text" name="Title" value={assetData['Title']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Employee Type Segment</label>
                                <input type="text" name="Employee Type" placeholder="e.g. Contract / Permanent" value={assetData['Employee Type']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Date of Joining</label>
                                <input type="date" name="Date of Joining" value={assetData['Date of Joining']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono relative" style={{ colorScheme: 'dark' }} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Training Date</label>
                                <input type="date" name="Training Date" value={assetData['Training Date']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono relative" style={{ colorScheme: 'dark' }} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Domain ID Create Date</label>
                                <input type="date" name="Domain ID Create Date" value={assetData['Domain ID Create Date']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono relative" style={{ colorScheme: 'dark' }} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: SPECIFIC HARDWARE DATA */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                            <HardDrive className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">3. Core Hardware Diagnostics & Tracking</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Asset No (Tracking Key)*</label>
                                <input type="text" name="Asset No" placeholder="Mongoose lookup key..." value={assetData['Asset No']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-emerald-400 font-bold rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Service Tag Reference*</label>
                                <input type="text" name="Service Tag" placeholder="Serial tracking key..." value={assetData['Service Tag']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-emerald-400 font-bold rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Hardware Model N Name</label>
                                <input type="text" name="Hardware Model N" placeholder="e.g. HP EliteBook 840 G8" value={assetData['Hardware Model N']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-white rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Asset Category Type</label>
                                <select name="Asset Type" value={assetData['Asset Type']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-500/30">
                                    <option value="Laptop">Laptop Computer</option>
                                    <option value="Desktop">Desktop Tower</option>
                                    <option value="Tab">Tablet Device</option>
                                    <option value="Printer">Office Printer</option>
                                    <option value="UPS">UPS System</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Asset Status State</label>
                                <select name="Asset Status" value={assetData['Asset Status']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-500/30">
                                    <option value="Available">Available Stockpile</option>
                                    <option value="In Use">Active: In Use</option>
                                    <option value="Scrap">Scrap / Write-off</option>
                                    <option value="Maintenance">Maintenance Facility</option>
                                </select>
                            </div>

                            {/* 🌟 ADDED SELECT DROP INPUT FIELD: System Auditing Compliance Level Selector */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">System Compliance Status</label>
                                <div className="relative">
                                    <select 
                                        name="isCompliant" 
                                        value={assetData['isCompliant']} 
                                        onChange={handleInputChange} 
                                        className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 pr-8 outline-none focus:border-emerald-500/30 cursor-pointer appearance-none"
                                    >
                                        <option value="Under Review"> Under Review / Pending</option>
                                        <option value="Compliant"> Compliant (Audit Pass)</option>
                                        <option value="Non-Compliant"> Non-Compliant (Flagged)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Make Manufacturer</label>
                                <input type="text" name="Make" placeholder="HP, Dell, Lenovo..." value={assetData['Make']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Operating System</label>
                                <input type="text" name="Operating System" value={assetData['Operating System']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Hostname Network ID</label>
                                <input type="text" name="Hostname" placeholder="e.g. NGH-LAP-102" value={assetData['Hostname']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Mac Address</label>
                                <input type="text" name="Mac Address" placeholder="00:0A:95:9D:68:16" value={assetData['Mac Address']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">SCCM Client Status</label>
                                <input type="text" name="SCCM" value={assetData['SCCM']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-boldxl text-slate-400 font-mono uppercase block mb-1">Memory Configuration</label>
                                <input type="text" name="Memory" placeholder="e.g. 16GB RAM" value={assetData['Memory']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Processor Model</label>
                                <input type="text" name="Processor" placeholder="Core i7 11th Gen" value={assetData['Processor']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: INVOICING & COMPLIANCE */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">4. Financial Invoicing & Auditing Audits</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Invoice Number</label>
                                <input type="text" name="Invoice No" value={assetData['Invoice No']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Invoice Date</label>
                                <input type="date" name="Invoice Date" value={assetData['Invoice Date']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono relative" style={{ colorScheme: 'dark' }} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Qty of Invoice</label>
                                <input type="text" name="Qty of Invoice" value={assetData['Qty of Invoice']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Invoice Value (Cost)</label>
                                <input type="text" name="Invoice Value" value={assetData['Invoice Value']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Capitalised Date at</label>
                                <input type="text" name="Capitalised at" value={assetData['Capitalised at']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Capitalised Year</label>
                                <input type="text" name="Capatilised Year" placeholder="e.g. 2024-2025" value={assetData['Capatilised Year']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">PO Number (PO No)</label>
                                <input type="text" name="PO No" value={assetData['PO No']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">PO Issue Date</label>
                                <input type="date" name="PO Date" value={assetData['PO Date']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono relative" style={{ colorScheme: 'dark' }} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: DEPLOYMENT TIMELINES & REMARKS */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                            <BadgePercent className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">5. Allocation Logistics & Deployment History</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Date of Assignment</label>
                                <input type="date" name="Date of Assignment" value={assetData['Date of Assignment'] || ''} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono relative" style={{ colorScheme: 'dark' }} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Received From Plant Office</label>
                                <input type="text" name="Received From (Pla" value={assetData['Received From (Pla']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Warranty Start Date</label>
                                <input type="date" name="Warranty Start Date" value={assetData['Warranty Start Date']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono relative" style={{ colorScheme: 'dark' }} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Warranty End Date</label>
                                <input type="date" name="Warranty End Date" value={assetData['Warranty End Date']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono relative" style={{ colorScheme: 'dark' }} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Adapter Serial No</label>
                                <input type="text" name="Adapter / Charger Serial no" value={assetData['Adapter / Charger Serial no']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Procured / Replace State</label>
                                <select name="Procured / Replace" value={assetData['Procured / Replace']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-500/30 text-slate-300">
                                    <option value="Procured">Standard Procured Unit</option>
                                    <option value="Replace">Replacement Deployment</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Physical Verification State</label>
                                <select name="Physical Verification Status" value={assetData['Physical Verification Status']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-500/30">
                                    <option value="Verified">Verified & Signed</option>
                                    <option value="Pending">Pending Audit Check</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Procured / Replace Remarks</label>
                                <input type="text" name="Procured / Replace Remarks" value={assetData['Procured / Replace Remarks']} onChange={handleInputChange} className="w-full bg-[#070b13] border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500/30" />
                            </div>
                        </div>
                    </div>

                    {/* Form Controls Action Buttons Bar */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-800 mt-8">
                        <button
                            type="button"
                            onClick={() => window.location.href = '/asset-inventory'}
                            className="inline-flex items-center px-5 py-2.5 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-800/80 transition-all duration-150"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back To Directory
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(16,185,129,0.25)] active:scale-[0.98]"
                        >
                            <Save className="w-3.5 h-3.5 mr-2" /> Save System Document
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddNewAsset;