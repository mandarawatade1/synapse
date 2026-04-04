import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Brain, BookOpen, Sparkles, AudioLines, Youtube,
  Timer, TrendingUp, Calculator, CalendarDays, Settings, Map, FileText,
  Search, ArrowUpRight, X
} from 'lucide-react';

const allTools = [
  { path: '/advisor', icon: MessageSquare, label: 'Study Buddy', group: 'Learn', color: 'text-purple-400', description: 'AI-powered tutor for personalized learning and guidance.' },
  { path: '/quiz', icon: Brain, label: 'Quiz Maker', group: 'Learn', color: 'text-pink-400', description: 'Generate quizzes from your study notes instantly with AI.' },
  { path: '/notes', icon: BookOpen, label: 'Notes', group: 'Learn', color: 'text-blue-400', description: 'Organize and manage your digital study materials efficiently.' },
  { path: '/flashcards', icon: Sparkles, label: 'Flashcards', group: 'Learn', color: 'text-amber-400', description: 'Master any subject with AI-generated spaced repetition.' },
  { path: '/transcript', icon: AudioLines, label: 'Transcripts', group: 'Media', color: 'text-pink-400', description: 'Convert audio recordings into readable, searchable text.' },
  { path: '/video-transcript', icon: Youtube, label: 'Video Transcript', group: 'Media', color: 'text-red-500', description: 'Extract and summarize key insights from YouTube videos.' },
  { path: '/timer', icon: Timer, label: 'Focus Timer', group: 'Track', color: 'text-teal-400', description: 'Boost productivity with customizable Pomodoro sessions.' },
  { path: '/performance', icon: TrendingUp, label: 'Performance', group: 'Track', color: 'text-amber-400', description: 'Track your academic progress and gain actionable insights.' },
  { path: '/gpa', icon: Calculator, label: 'GPA Calculator', group: 'Track', color: 'text-blue-400', description: 'Calculate and forecast your academic standing easily.' },
  { path: '/timetable', icon: CalendarDays, label: 'Timetable', group: 'Track', color: 'text-blue-400', description: 'Manage your weekly class schedule and important deadlines.' },
  { path: '/planner', icon: Settings, label: 'Exam Prep', group: 'Build', color: 'text-gray-400', description: 'Strategic AI-driven preparation for your upcoming exams.' },
  { path: '/roadmap', icon: Map, label: 'Skill Roadmap', group: 'Build', color: 'text-green-400', description: 'Personalized learning path to master any new technology.' },
  { path: '/resume', icon: FileText, label: 'Resume Builder', group: 'Build', color: 'text-purple-400', description: 'Craft professional resumes with intelligent AI assistance.' },
  { path: '/interview', icon: MessageSquare, label: 'Interview Prep', group: 'Build', color: 'text-purple-400', description: 'Practice coding and behavioral interviews in a simulation.' },
];

export default function AllTools() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return allTools;
    return allTools.filter(t => 
      t.label.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.group.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groups = Array.from(new Set(allTools.map(t => t.group)));

  return (
    <div className="p-8 pb-32 max-w-[1600px] mx-auto min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-text-primary mb-2">All Tools</h1>
          <p className="text-text-secondary text-lg">Explore and manage all available Synapse features.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted group-focus-within:text-brand-400 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search tools, tags, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-16">
        {groups.map(group => {
          const toolsInGroup = filteredTools.filter(t => t.group === group);
          if (toolsInGroup.length === 0) return null;

          return (
            <div key={group} className="space-y-8">
              {/* Section Divider */}
              <div className="flex items-center gap-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-text-muted whitespace-nowrap">
                  {group}
                </h2>
                <div className="h-px w-full bg-border-subtle/50" />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                {toolsInGroup.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className="block"
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, backgroundColor: 'var(--surface-hover, #1a1a1b)' }}
                      className="p-5 h-full bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 bg-bg-base rounded-xl w-11 h-11 flex items-center justify-center border border-border-subtle group-hover:border-${tool.color.split('-')[1]}-500/30 transition-all duration-300`}>
                          <tool.icon size={22} className={`${tool.color} transition-transform duration-500 group-hover:scale-110`} />
                        </div>
                        <motion.div 
                          initial={{ opacity: 0, x: -5 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="text-brand-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <ArrowUpRight size={18} />
                        </motion.div>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-bold text-text-primary group-hover:text-brand-400 transition-colors flex items-center gap-2">
                          {tool.label}
                        </h3>
                        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                      
                      {/* Decorative gradient corner */}
                      <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-br from-transparent to-brand-500/5 rounded-br-2xl transition-opacity opacity-0 group-hover:opacity-100" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface border border-border-subtle mb-4 text-text-muted">
            <Search size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No tools found</h3>
          <p className="text-text-secondary">Try searching for something else or browse categories.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 px-5 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition-colors"
          >
            Clear Search
          </button>
        </motion.div>
      )}
    </div>
  );
}

