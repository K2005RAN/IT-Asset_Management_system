import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Lock, ChevronDown } from 'lucide-react';

const CreateUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userId: '',
        username: '',
        email: '',
        role: 'employee',
        password: ''
    });
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (selectedRole) => {
        setFormData({ ...formData, role: selectedRole });
        setRoleDropdownOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/users', formData);
            if (response.status === 201) {
                alert('User account created successfully!');
                navigate('/user-management');
            }
        } catch (error) {
            console.error('❌ Error provisioning system credentials:', error);
            alert(error.response?.data?.message || 'Failed to register profile.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
            
            {/* User ID Field */}
            <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                    <span>User ID</span>
                </label>
                <input
                    type="text"
                    name="userId"
                    required
                    placeholder="e.g., EMP101"
                    value={formData.userId}
                    onChange={handleChange}
                    className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 hover:border-slate-700/80 transition-all duration-200"
                />
            </div>

            {/* Username Field */}
            <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                    <span>User Name</span>
                </label>
                <input
                    type="text"
                    name="username"
                    required
                    placeholder="e.g., John Doe"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 hover:border-slate-700/80 transition-all duration-200"
                />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                    <span>Email Address</span>
                </label>
                <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@heidelberg.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 hover:border-slate-700/80 transition-all duration-200"
                />
            </div>

            {/* Role Custom Select Dropdown Field */}
            <div className="space-y-2 relative">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                    <span>Account Security Role</span>
                </label>
                <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="w-full flex items-center justify-between bg-[#0a0f1d] border border-slate-800 text-slate-200 rounded-xl py-3 px-4 text-sm outline-none hover:border-slate-700 focus:border-emerald-500/50 transition-all duration-200"
                >
                    <span className="capitalize">{formData.role}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${roleDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                {roleDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1.5 bg-[#0e1426] border border-slate-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        <ul className="p-1 space-y-0.5">
                            {['employee', 'admin'].map((roleOpt) => (
                                <li key={roleOpt}>
                                    <button
                                        type="button"
                                        onClick={() => handleRoleSelect(roleOpt)}
                                        className={`w-full text-left px-4 py-2.5 text-sm rounded-lg capitalize transition-colors
                                            ${formData.role === roleOpt ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                                    >
                                        {roleOpt}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                    <span>Password</span>
                </label>
                <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#0a0f1d] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 hover:border-slate-700/80 transition-all duration-200"
                />
            </div>

            {/* Interactive Action Buttons Row */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/60 mt-6">
                <button
                    type="button"
                    onClick={() => navigate('/user-management')}
                    className="px-4 py-2.5 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-sm font-medium rounded-xl border border-slate-800/80 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_15px_rgba(16,185,129,0.2)] active:scale-[0.98]"
                >
                    Save User
                </button>
            </div>

        </form>
    );
};

export default CreateUser;