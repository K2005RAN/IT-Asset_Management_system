import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { HardDrive, Calendar, ShieldCheck, FileText, Save, ArrowLeft, Loader2 } from 'lucide-react';

const AddAssetForm = () => {
    const { assetId } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        assetId: assetId || '',
        assetName: '',
        scheduledDate: '',
        status: '',
    });

    // Fetch existing asset data if modifying an entry
    useEffect(() => {
        if (assetId) {
            const fetchAssetDetails = async () => {
                try {
                    const response = await axios.get(`/api/assets/${assetId}`);
                    const data = response.data;
                    setFormData({
                        assetId: data.assetId || assetId,
                        assetName: data.assetName || '',
                        scheduledDate: data.scheduledDate ? data.scheduledDate.substring(0, 10) : '',
                        status: data.status || '',
                    });
                } catch (error) {
                    console.error('Failed to resolve asset node fields:', error);
                }
            };
            fetchAssetDetails();
        }
    }, [assetId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (assetId) {
                await axios.put(`/api/assets/${assetId}`, formData);
            } else {
                await axios.post('/api/assets', formData);
            }
            navigate('/admin'); // Redirects smoothly back to our core workspace canvas
        } catch (error) {
            console.error('Error saving asset payload downstream:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 text-[#e2e8f0]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            {/* Top Interactive Row Control */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-5">
                <div className="flex items-center space-x-3">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="p-2 bg-[#0f1524] hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800/80 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <span className="text-[10px] font-black tracking-[0.25em] text-[#008744] uppercase font-mono block">
                            {assetId ? 'Mutation Payload Core' : 'Ingestion Matrix Pipe'}
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-white mt-1">
                            {assetId ? 'Modify Asset Node' : 'Register New Asset'}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Premium Slate Form Body Card */}
            <div className="bg-[#0f1524] rounded-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    
                    {/* First Input Row Column Splits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        
                        {/* Asset ID Field Input */}
                        <div className="space-y-2">
                            <label htmlFor="assetId" className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                                <span>Asset Identifier String</span>
                            </label>
                            <input
                                type="text"
                                id="assetId"
                                name="assetId"
                                value={formData.assetId}
                                onChange={handleChange}
                                className={`w-full bg-[#080c14] border rounded-xl py-3 px-4 text-sm font-semibold font-mono text-white placeholder-slate-600 outline-none transition-all ${
                                    assetId 
                                        ? 'border-slate-800 text-slate-500 cursor-not-allowed opacity-60' 
                                        : 'border-slate-800 focus:border-slate-700'
                                }`}
                                placeholder="e.g., HIC-NODE-102"
                                required
                                readOnly={!!assetId}
                            />
                        </div>

                        {/* Asset Name Field Input */}
                        <div className="space-y-2">
                            <label htmlFor="assetName" className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span>Asset Common Name</span>
                            </label>
                            <input
                                type="text"
                                id="assetName"
                                name="assetName"
                                value={formData.assetName}
                                onChange={handleChange}
                                className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-white placeholder-slate-600 outline-none focus:border-slate-700 transition-all font-sans"
                                placeholder="e.g., Heavy Equipment Router"
                                required
                            />
                        </div>

                    </div>

                    {/* Second Input Row Column Splits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        
                        {/* Scheduled Date Field Input */}
                        <div className="space-y-2">
                            <label htmlFor="scheduledDate" className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>Operational Audit Date</span>
                            </label>
                            <input
                                type="date"
                                id="scheduledDate"
                                name="scheduledDate"
                                value={formData.scheduledDate}
                                onChange={handleChange}
                                className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold font-mono text-white outline-none focus:border-slate-700 transition-all color-scheme-dark"
                                style={{ colorScheme: 'dark' }}
                                required
                            />
                        </div>

                        {/* Select Status Dropdown Option Component */}
                        <div className="space-y-2">
                            <label htmlFor="status" className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                                <span>Deployment Status</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-white outline-none focus:border-slate-700 transition-all appearance-none cursor-pointer font-sans"
                                    required
                                >
                                    <option value="" className="text-slate-600">Select Parameter State</option>
                                    <option value="Active" className="text-slate-300">Active / Operational</option>
                                    <option value="Inactive" className="text-slate-300">Inactive / Decommissioned</option>
                                    <option value="Repair" className="text-slate-300">Under Maintenance / Repair</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    ▼
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Action Execution Footer Button */}
                    <div className="flex justify-end pt-4 border-t border-slate-800/60 mt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 px-6 py-3 bg-[#008744] hover:bg-[#007038] text-white text-xs font-black uppercase tracking-[0.12em] rounded-xl shadow-[0_4px_20px_rgba(0,135,68,0.25)] border border-emerald-500/10 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Committing Schema...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Commit Entry</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddAssetForm;