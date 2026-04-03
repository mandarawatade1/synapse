
import React, { useState } from 'react';
import {
    Map,
    Loader2,
    RefreshCcw,
    Terminal,
    Check,
    ArrowDown,
    BookOpen,
    Info
} from 'lucide-react';
import { generateDynamicRoadmap } from '../src/services/geminiService';
import { RoadmapData, RoadmapNode } from '../types';

const Roadmap: React.FC = () => {
    const [role, setRole] = useState('Frontend Developer');
    const [data, setData] = useState<RoadmapData | null>(null);
    const [loading, setLoading] = useState(false);
    const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());

    const fetchRoadmap = async () => {
        if (!role.trim()) return;
        setLoading(true);
        try {
            const result = await generateDynamicRoadmap(role);
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleNode = (id: string) => {
        const next = new Set(completedNodes);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCompletedNodes(next);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950 transition-colors">
            {/* Control Sidebar */}
            <aside className="w-80 border-r dark:border-slate-800 flex flex-col bg-gray-50/50 dark:bg-slate-900/30 overflow-y-auto p-6 space-y-6">
                <header>
                    <h1 className="text-2xl font-black dark:text-white flex items-center gap-3">
                        <Map className="text-brand-600" /> <span className="font-logo">Synapse</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Canonical Roadmaps</p>
                </header>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Role</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                            placeholder="e.g. Backend Engineer"
                            onKeyDown={(e) => e.key === 'Enter' && fetchRoadmap()}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed px-1">
                        Enter any tech role to generate a standard, step-by-step learning path inspired by roadmap.sh.
                    </p>
                </div>

                <button
                    onClick={fetchRoadmap}
                    disabled={loading || !role.trim()}
                    className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-95 disabled:bg-gray-400"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <RefreshCcw size={18} />}
                    Generate Roadmap
                </button>

                {data && (
                    <div className="mt-auto pt-6 border-t dark:border-slate-800">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                                <Info size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Guide</span>
                            </div>
                            <p className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                                Start from the top. Mandatory skills are highlighted. Click items to mark progress.
                            </p>
                        </div>
                    </div>
                )}
            </aside>

            {/* Visualization Canvas */}
            <main className="flex-1 relative overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950">
                {!data && !loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6 opacity-60">
                        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-gray-300 dark:text-slate-700 shadow-sm">
                            <Terminal size={48} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black dark:text-white">Ready to Map</h2>
                            <p className="text-gray-500 mt-2 font-medium text-sm">Enter a role to build your curriculum.</p>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black dark:text-white">Architecting Roadmap...</p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Analyzing Industry Standards</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
                        <div className="w-full max-w-[1600px] mx-auto xl:px-12 pb-20">

                            <div className="text-center mb-16 space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 rounded-full border dark:border-slate-800 shadow-sm mb-4">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Roadmap</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{data.role}</h1>
                                <p className="text-gray-500 font-medium">Step-by-step guide to becoming a {data.role}</p>
                            </div>

                            <div className="space-y-4 relative">
                                {/* Vertical Spine Line */}
                                <div className="absolute left-8 md:left-1/2 top-4 bottom-0 w-1 bg-gray-200 dark:bg-slate-800 -translate-x-1/2 hidden md:block rounded-full"></div>

                                {data.sections.map((section, index) => (
                                    <div key={index} className="relative z-10 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>

                                        {/* Section Header (The 'milestone' marker) */}
                                        <div className="flex justify-start md:justify-center mb-6 sticky top-0 z-20 py-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm">
                                            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-full font-black text-sm shadow-xl flex items-center gap-2 border-4 border-white dark:border-slate-900">
                                                <span className="uppercase tracking-widest">{section.section_name}</span>
                                                <ArrowDown size={14} />
                                            </div>
                                        </div>

                                        {/* Nodes Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-0">
                                            {section.nodes.sort((a, b) => a.order - b.order).map((node) => {
                                                const isCompleted = completedNodes.has(node.id);
                                                return (
                                                    <div
                                                        key={node.id}
                                                        onClick={() => toggleNode(node.id)}
                                                        className={`
                                                    group relative p-5 rounded-2xl border-2 transition-all cursor-pointer select-none
                                                    ${isCompleted
                                                                ? 'bg-green-50 dark:bg-green-900/10 border-green-500 dark:border-green-500/50'
                                                                : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-600 hover:shadow-lg'
                                                            }
                                                `}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className={`
                                                        w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors
                                                        ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:bg-brand-100 dark:group-hover:bg-slate-700'}
                                                    `}>
                                                                {isCompleted ? <Check size={14} /> : node.order}
                                                            </div>
                                                            {node.mandatory && (
                                                                <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[9px] font-black uppercase rounded">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className={`text-lg font-bold mb-1 transition-colors ${isCompleted ? 'text-green-800 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                            {node.label}
                                                        </h3>

                                                        {node.description && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                                {node.description}
                                                            </p>
                                                        )}

                                                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-brand-600 uppercase tracking-widest">
                                                                <BookOpen size={12} /> Resources
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Connector Line for mobile logic if needed, but the spine handles visual connection */}
                                        <div className="h-12"></div>
                                    </div>
                                ))}

                                <div className="flex justify-center pt-8 pb-20">
                                    <div className="px-8 py-4 bg-brand-600 text-white rounded-full font-black text-lg shadow-2xl shadow-brand-500/40 animate-bounce">
                                        Job Ready!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Roadmap;
