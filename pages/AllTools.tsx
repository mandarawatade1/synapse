import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Brain, BookOpen, Sparkles, AudioLines, Youtube,
  Timer, TrendingUp, Calculator, CalendarDays, Settings, Map, FileText
} from 'lucide-react';

const allTools = [
  { path: '/advisor', icon: MessageSquare, label: 'Study Buddy', group: 'Learn', color: 'text-indigo-400' },
  { path: '/quiz', icon: Brain, label: 'Quiz Maker', group: 'Learn', color: 'text-purple-400' },
  { path: '/notes', icon: BookOpen, label: 'Notes', group: 'Learn', color: 'text-blue-400' },
  { path: '/flashcards', icon: Sparkles, label: 'Flashcards', group: 'Learn', color: 'text-amber-400' },
  { path: '/transcript', icon: AudioLines, label: 'Transcripts', group: 'Media', color: 'text-pink-400' },
  { path: '/video-transcript', icon: Youtube, label: 'Video Transcript', group: 'Media', color: 'text-red-500' },
  { path: '/timer', icon: Timer, label: 'Focus Timer', group: 'Track', color: 'text-green-500' },
  { path: '/performance', icon: TrendingUp, label: 'Performance', group: 'Track', color: 'text-teal-400' },
  { path: '/gpa', icon: Calculator, label: 'GPA Calculator', group: 'Track', color: 'text-orange-400' },
  { path: '/timetable', icon: CalendarDays, label: 'Timetable', group: 'Track', color: 'text-sky-400' },
  { path: '/planner', icon: Settings, label: 'Exam Prep', group: 'Build', color: 'text-gray-400' },
  { path: '/roadmap', icon: Map, label: 'Skill Roadmap', group: 'Build', color: 'text-emerald-400' },
  { path: '/resume', icon: FileText, label: 'Resume Builder', group: 'Build', color: 'text-fuchsia-400' },
  { path: '/interview', icon: MessageSquare, label: 'Interview Prep', group: 'Build', color: 'text-indigo-400' },
];

export default function AllTools() {
  const groups = Array.from(new Set(allTools.map(t => t.group)));

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-text-primary mb-2">All Tools</h1>
        <p className="text-text-secondary">Explore all available Synapse features and resources.</p>
      </div>

      <div className="space-y-12">
        {groups.map(group => (
          <div key={group} className="space-y-6">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-text-muted">{group}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allTools.filter(t => t.group === group).map((tool, i) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                >
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="p-5 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-brand-500/30 transition-all cursor-pointer group"
                  >
                    <div className="p-3 bg-bg-base rounded-xl w-12 h-12 flex items-center justify-center border border-border-subtle group-hover:border-transparent transition-colors">
                      <tool.icon size={22} className={`${tool.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-sm group-hover:text-brand-400 transition-colors">{tool.label}</h3>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
