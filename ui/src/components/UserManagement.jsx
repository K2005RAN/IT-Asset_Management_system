import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Shield, User, MapPin, Briefcase, Database, Loader2 } from 'lucide-react';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user => {
            const uId = user.userId || '';
            const uName = user.username || user.userName || '';
            const fName = user.firstName || '';
            const lName = user.lastName || '';
            const uEmail = user.email || '';
            const uRole = user.role || user.userType || '';
            const uDept = user.department || '';
            const uPlant = user.plant || '';
            
            const matchedString = `${uId} ${uName} ${fName} ${lName} ${uEmail} ${uRole} ${uDept} ${uPlant}`.toLowerCase();
            return matchedString.includes(searchQuery.toLowerCase());
        });
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/employees');
            if (response.data && Array.isArray(response.data)) {
                setUsers(response.data);
                setFilteredUsers(response.data);
            }
        } catch (error) {
            console.error('❌ Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 FIXED WORKFORCE PORTAL UPLOAD PROCESSOR
    const handleStaffSpreadsheetUploadPortal = async (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            alert("File format error: Please select a valid employee details file (.csv).");
            return;
        }

        if (window.confirm(`CRITICAL WARNING: This action will completely drop all existing standard employee profiles and rebuild them using [${selectedFile.name}]. All accounts will instantly gain uniform password access set to 'HCIL2026'. Proceed?`)) {
            try {
                setSyncing(true);
                
                // ✅ FIXED payload variable references matching your backend expectations perfectly
                const multipartFormData = new FormData();
                multipartFormData.append('file', selectedFile);

                const res = await axios.post("/api/admin/upload-employees-csv", multipartFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data.success) {
                    alert(res.data.message || "Workforce metrics successfully parsed!");
                    fetchData(); // Reload live screen table rows grid directly
                }
            } catch (err) {
                console.error("Staff bulk sync pipeline rejected:", err);
                alert(err.response?.data?.error || "Handshake rejected during server ingestion mapping loops.");
            } finally {
                setSyncing(false);
                event.target.value = ""; // Flush input element target
            }
        }
    };

    const handleEditUser = (userId) => {
        navigate(`/edit-user/${userId}`);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user profile?')) {
            try {
                await axios.delete(`/api/users/${userId}`);
                setUsers(users.filter(user => user.userId !== userId));
                setFilteredUsers(filteredUsers.filter(user => user.userId !== userId));
            } catch (error) {
                console.error('❌ Error removing user account:', error);
            }
        }
    };

    return (
        <div className="space-y-5">
            {/* Action Bar: Search Input Control */}
            <div className="flex items-center justify-between p-4 bg-slate-900/20 border-b border-slate-800/60 gap-3">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search workforce profiles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-2 pl-9 pr-4 text-xs font-medium outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-200"
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    {/* HIDDEN PORTAL INPUT & CSV TRIGGER */}
                    <div className="relative">
                        <input 
                            type="file" 
                            id="workforcePortalSpreadsheetInputNode" 
                            accept=".csv" 
                            onChange={handleStaffSpreadsheetUploadPortal} 
                            className="hidden" 
                            disabled={syncing || loading}
                        />
                        <button 
                            type="button"
                            onClick={() => document.getElementById('workforcePortalSpreadsheetInputNode').click()}
                            disabled={syncing || loading}
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-150 active:scale-95 border border-slate-700/60"
                        >
                            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1 text-blue-400" /> : <Database className="w-3.5 h-3.5 mr-1 text-blue-400" />}
                            <span>Upload Staff CSV</span>
                        </button>
                    </div>

                    <button 
                        onClick={() => navigate('/create-user')}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New User</span>
                    </button>
                </div>
            </div>

            {/* Ingestion Table Grid View */}
            <div className="overflow-x-auto px-4 pb-4">
                {loading ? (
                    <div className="p-16 text-center text-xs font-medium text-slate-500 font-mono tracking-wide uppercase animate-pulse flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Loading database profiles...</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-16 text-center text-sm font-medium text-slate-500">
                        No user records found matching search criteria.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="text-slate-400 font-semibold border-b border-slate-800/40 text-xs uppercase tracking-wider">
                                <th className="py-3 px-4 font-mono">Employee ID</th>
                                <th className="py-3 px-4">User Details</th>
                                <th className="py-3 px-4">Corporate Email</th>
                                <th className="py-3 px-4">Department</th>
                                <th className="py-3 px-4">Plant Hub</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30 text-slate-300">
                            {filteredUsers.map((user) => {
                                const currentRole = user.role || user.userType || 'employee';
                                const isAdmin = currentRole.toLowerCase() === 'admin';
                                
                                return (
                                    <tr key={user._id || user.userId} className="hover:bg-slate-900/10 transition-colors duration-150">
                                        <td className="py-3.5 px-4 text-slate-400 font-mono text-xs font-bold">{user.userId}</td>
                                        <td className="py-3.5 px-4 text-slate-200 font-medium">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'}`}></div>
                                                <span className="font-sans font-semibold text-white group-hover:text-emerald-400">
                                                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                                                </span>
                                            </div>
                                            {user.title && <span className="block text-[11px] text-slate-500 font-mono mt-0.5 ml-3.5">{user.title}</span>}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">{user.email}</td>
                                        <td className="py-3.5 px-4 font-sans text-xs">
                                            <div className="flex items-center text-slate-400 space-x-1.5">
                                                <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                                                <span>{user.department || 'General Sector'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-sans text-xs">
                                            <div className="inline-flex items-center space-x-1 bg-slate-800/30 border border-slate-800 px-2 rounded-md py-0.5 text-slate-300">
                                                <MapPin className="w-3 h-3 text-emerald-500/60" />
                                                <span>{user.plant || 'Narsinghgarh'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="inline-flex items-center justify-end space-x-1">
                                                <button onClick={() => handleEditUser(user.userId)} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-all">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.userId)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
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
        </div>
    );
};

export default UserManagement;