import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, SlidersHorizontal, Loader2 } from 'lucide-react';

const AssetInventory = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = assets.filter(asset => {
            const query = searchQuery.toLowerCase();
            return (
                (asset.assetId && asset.assetId.toLowerCase().includes(query)) ||
                (asset.assetName && asset.assetName.toLowerCase().includes(query)) ||
                (asset.assetType && asset.assetType.toLowerCase().includes(query)) ||
                (asset.model && asset.model.toLowerCase().includes(query)) ||
                (asset.serialNumber && asset.serialNumber.toLowerCase().includes(query)) ||
                (asset.location && asset.location.toLowerCase().includes(query))
            );
        });
        setFilteredAssets(filtered);
    }, [searchQuery, assets]);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/assets');
            setAssets(response.data);
            setFilteredAssets(response.data);
        } catch (error) {
            console.error('Error fetching cluster inventory records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditAsset = (assetId) => {
        navigate(`/edit-asset/${assetId}`);
    };

    const handleDeleteAsset = async (assetId) => {
        if (window.confirm('Are you certain you want to purge this asset node entry from the system?')) {
            try {
                await axios.delete(`/api/assets/${assetId}`);
                setAssets(assets.filter(asset => asset.assetId !== assetId));
                setFilteredAssets(filteredAssets.filter(asset => asset.assetId !== assetId));
            } catch (error) {
                console.error('Error executing deletion payload:', error);
            }
        }
    };

    return (
        <div className="bg-[#0f1524] rounded-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden font-sans text-slate-300">
            
            {/* Control Bar & Search Actions Area */}
            <div className="p-6 border-b border-slate-800/70 bg-[#141c30]/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/5 text-[#008744] border border-emerald-500/10 rounded-xl">
                        <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase font-mono">
                        Active asset Database 
                    </h3>
                </div>

                <div className="flex items-center flex-1 md:max-w-md gap-3 w-full">
                    {/* High-Tech Integrated Search Box Input */}
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="asset details, location, IDs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium font-mono text-white placeholder-slate-500 outline-none focus:border-slate-700 transition-all"
                        />
                    </div>

                    <Link to="/add-newAsset" className="shrink-0">
                        <button className="flex items-center space-x-2 px-4 py-2.5 bg-[#008744] hover:bg-[#007038] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Asset</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Main Interactive Matrix Ledger View */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-6 h-6 text-[#008744] animate-spin" />
                        <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-slate-500">Fetching live node array...</span>
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div className="p-16 text-center text-xs font-bold tracking-wide text-slate-500 font-mono uppercase">
                        0 item matched.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                            <tr className="bg-[#0b0f19] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-800">
                                <th className="py-4 px-6">Asset ID</th>
                                <th className="py-4 px-6 font-sans">Asset Name</th>
                                <th className="py-4 px-6 font-sans">Type</th>
                                <th className="py-4 px-6">Model SKU</th>
                                <th className="py-4 px-6">Serial No.</th>
                                <th className="py-4 px-6">Acquisition</th>
                                <th className="py-4 px-6">Warranty</th>
                                <th className="py-4 px-6 font-sans">Location</th>
                                <th className="py-4 px-6 text-right font-sans">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-slate-400 font-semibold">
                            {filteredAssets.map(asset => (
                                <tr key={asset.assetId} className="hover:bg-[#151e33]/30 transition-colors group">
                                    <td className="py-4 px-6 text-slate-500 font-bold">{asset.assetId}</td>
                                    <td className="py-4 px-6 text-white font-bold font-sans text-sm group-hover:text-emerald-400 transition-colors">
                                        {asset.assetName}
                                    </td>
                                    <td className="py-4 px-6 font-sans text-slate-400">{asset.assetType}</td>
                                    <td className="py-4 px-6 text-slate-300">{asset.model}</td>
                                    <td className="py-4 px-6 text-slate-500">{asset.serialNumber}</td>
                                    <td className="py-4 px-6 text-slate-400">
                                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                    </td>
                                    <td className="py-4 px-6 text-slate-500">{asset.warranty || 'N/A'}</td>
                                    <td className="py-4 px-6 font-sans text-slate-300">
                                        <span className="inline-flex items-center space-x-1.5">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]"></span>
                                            <span>{asset.location}</span>
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right font-sans">
                                        <div className="inline-flex items-center justify-end space-x-2">
                                            <button 
                                                onClick={() => handleEditAsset(asset.assetId)}
                                                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/60 transition-all"
                                                title="Edit Node Parameters"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAsset(asset.assetId)}
                                                className="p-1.5 bg-rose-500/5 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition-all"
                                                title="Purge Node Entity"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AssetInventory;