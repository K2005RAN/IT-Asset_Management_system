import React, { useEffect, useState } from 'react';
import { Laptop, Calendar, User, Briefcase, Hash } from 'lucide-react';

const EmployeeDashboard = () => {
    const [assignedAssets, setAssignedAssets] = useState([]);
    const [employeeDetails, setEmployeeDetails] = useState({ firstName: '', lastName: '', userId: '', department: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUserEmail = localStorage.getItem("userEmail");
        if (!storedUserEmail) {
            setError("No active login session found. Please log in again.");
            setLoading(false);
            return;
        }
        fetchDashboardData(storedUserEmail);
    }, []);

    const fetchDashboardData = async (email) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            // 1. Fetch employee profile
            const userResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : "" 
                }
            });

            if (!userResponse.ok) {
                throw new Error('Session expired. Please log out and log back in.');
            }
            
            const userData = await userResponse.json();
            const currentEmployee = Array.isArray(userData) ? userData[0] : userData;

            if (currentEmployee) {
                const empFirstName = currentEmployee.firstName || 'Employee';
                const empLastName = currentEmployee.lastName || '';
                const empId = currentEmployee.userId || 'N/A';
                const empDept = currentEmployee.department || 'General Operations';

                setEmployeeDetails({
                    firstName: empFirstName,
                    lastName: empLastName,
                    userId: empId,
                    department: empDept
                });

                // 2. Fetch assigned assets
                if (empId !== 'N/A') {
                    const assetsResponse = await fetch(`/api/assignments?userId=${encodeURIComponent(empId)}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": token ? `Bearer ${token}` : ""
                        }
                    });
                    if (assetsResponse.ok) {
                        const assetsData = await assetsResponse.json();
                        setAssignedAssets(assetsData);
                    }
                }
            } else {
                throw new Error("Employee email not found in system records.");
            }
        } catch (error) {
            setError(error.message || 'Unable to load assigned asset information.');
            console.error('Dashboard fetch exception:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0a0f1d] min-h-screen text-slate-200 antialiased font-sans pt-10 px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* ── PROFILE INFORMATION CARD ── */}
                <div className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl h-fit relative overflow-hidden">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 border border-emerald-500/20">
                        <span className="text-emerald-400 font-extrabold text-xl uppercase font-mono">
                            {employeeDetails.firstName ? employeeDetails.firstName.charAt(0) : 'E'}
                        </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        {loading ? "Loading Profile..." : `${employeeDetails.firstName} ${employeeDetails.lastName}`}
                    </h2>
                    
                    <div className="inline-flex items-center space-x-1.5 bg-slate-800/40 border border-slate-700/60 px-2.5 py-1 rounded-md text-xs text-slate-300 mt-2 font-medium">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{loading ? "Syncing..." : employeeDetails.department}</span>
                    </div>

                    <div className="mt-6 space-y-4 border-t border-slate-800/80 pt-5 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                <Hash className="w-3.5 h-3.5" /> Employee ID
                            </span>
                            <span className="font-mono text-slate-300 font-bold text-sm bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                                {loading ? "..." : employeeDetails.userId}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                <User className="w-3.5 h-3.5" /> Portal Status
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Active Employee
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── ASSIGNED DEVICES TABLE ── */}
                <div className="lg:col-span-8 bg-[#111827] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-[#141d2f]/40">
                        <div className="flex items-center space-x-2.5">
                            <Laptop className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                                Devices Assigned to Me
                            </h3>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-3 py-1 rounded-full text-xs font-mono">
                            {assignedAssets.length} Active {assignedAssets.length === 1 ? 'Device' : 'Devices'}
                        </span>
                    </div>

                    {error && (
                        <div className="m-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-xs font-mono">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#141d2f]/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider font-mono">
                                    <th className="py-4 px-6">Asset ID</th>
                                    <th className="py-4 px-6">Device Name & Type</th>
                                    <th className="py-4 px-6">Date Received</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono text-[12px]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-16 text-center text-slate-500 animate-pulse font-mono tracking-wider text-xs">
                                            Loading assigned equipment details...
                                        </td>
                                    </tr>
                                ) : assignedAssets.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-16 text-center text-slate-500 font-sans text-sm">
                                            No company assets are currently assigned to your profile.
                                        </td>
                                    </tr>
                                ) : (
                                    assignedAssets.map((asset, index) => (
                                        <tr key={asset._id || index} className="hover:bg-[#162136]/30 transition-colors group">
                                            {/* Asset ID String */}
                                            <td className="py-5 px-6 text-emerald-400 font-bold font-mono text-sm">
                                                {asset.assetId || "—"}
                                            </td>
                                            
                                            {/* Cleaned Device Name & Specifications */}
                                            <td className="py-5 px-6 font-sans">
                                                <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                                                    {asset.assetName}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                                                    Category: {asset.assetType || 'Equipment'}
                                                </div>
                                            </td>
                                            
                                            {/* Allocation Date received */}
                                            <td className="py-5 px-6 text-slate-400 font-mono text-xs">
                                                <div className="flex items-center space-x-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                                    <span>
                                                        {asset.assignmentDate 
                                                            ? new Date(asset.assignmentDate).toLocaleDateString('en-IN', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }) 
                                                            : 'Verified'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeDashboard;