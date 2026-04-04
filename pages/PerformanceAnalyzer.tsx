import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Loader2, Sparkles, Plus, Trash2, UploadCloud, CheckCircle2, AlertCircle, ArrowRight, Target, History, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeStudentPerformance } from '../src/services/geminiService';
import { savePerformanceReport, getPerformanceHistory } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { useUser } from '../App';
import { SubjectScore, PerformanceReport } from '../types';

const PerformanceAnalyzer: React.FC = () => {
  const { user } = useUser();
  const [examName, setExamName] = useState('');
  const [subjects, setSubjects] = useState<SubjectScore[]>([
    { subject: '', score: 0, maxScore: 100, grade: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [history, setHistory] = useState<PerformanceReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(true);

  useEffect(() => {
    if (auth.currentUser) {
      getPerformanceHistory(auth.currentUser.uid).then(setHistory).catch(() => {});
    }
  }, [report]);

  const addSubject = () => {
    setSubjects([...subjects, { subject: '', score: 0, maxScore: 100, grade: '' }]);
  };

  const removeSubject = (idx: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const updateSubject = (idx: number, field: string, value: any) => {
    const updated = [...subjects];
    (updated[idx] as any)[field] = value;
    // Auto grade
    if (field === 'score' || field === 'maxScore') {
      const pct = (updated[idx].score / updated[idx].maxScore) * 100;
      updated[idx].grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
    }
    setSubjects(updated);
  };

  const validSubjects = subjects.filter(s => s.subject.trim());

  const analyze = async () => {
    if (!examName.trim() || validSubjects.length === 0) {
      alert('Please enter an exam name and at least one subject.');
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const result = await analyzeStudentPerformance(
        validSubjects, examName, user?.targetRole, user?.currentLevel
      );
      const totalScore = validSubjects.reduce((a, s) => a + s.score, 0);
      const totalMax = validSubjects.reduce((a, s) => a + s.maxScore, 0);
      const overallPercent = Math.round((totalScore / totalMax) * 100);

      const newReport: PerformanceReport = {
        id: `perf_${Date.now()}`,
        examName,
        subjects: validSubjects,
        overallPercent,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        improvementPlan: result.improvementPlan,
        createdAt: new Date().toISOString()
      };
      setReport(newReport);

      if (auth.currentUser) {
        try { await savePerformanceReport(auth.currentUser.uid, newReport); } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = report?.subjects.map(s => ({
    name: s.subject.length > 12 ? s.subject.slice(0, 12) + '...' : s.subject,
    score: Math.round((s.score / s.maxScore) * 100),
  })) || [];

  const getBarColor = (pct: number) => pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : pct >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Performance Analyzer <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">AI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Analyze exam scores and get a personalized improvement plan.</p>
        </div>
        <div className="flex items-center gap-3 md:pr-24">
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <History size={16} /> Past Reports
          </button>
        </div>
      </header>
 
      {showHistory && (
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">History</h3>
          {history.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map(h => (
                <div key={h.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                  <div>
                    <p className="font-bold dark:text-white">{h.examName}</p>
                    <p className="text-xs text-gray-400">{h.subjects.length} subjects • {new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-lg font-black ${h.overallPercent >= 70 ? 'text-green-500' : h.overallPercent >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {h.overallPercent}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4 text-sm font-medium">No past reports found yet.</p>
          )}
        </div>
      )}
 
      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT: Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Exam Name *</label>
              <input
                value={examName}
                onChange={e => setExamName(e.target.value)}
                placeholder="e.g. Midterm Sem 4, JEE Mains Mock..."
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-brand-600 outline-none font-bold dark:text-white transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subjects & Scores</label>
              {subjects.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                  <input
                    placeholder="Subject"
                    value={s.subject}
                    onChange={e => updateSubject(idx, 'subject', e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-bold text-sm dark:text-white"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={s.score}
                      onChange={e => updateSubject(idx, 'score', +e.target.value)}
                      className="w-16 bg-white dark:bg-slate-900 rounded-lg p-2 text-center font-bold text-sm border dark:border-slate-700 dark:text-white"
                    />
                    <span className="text-gray-400 text-sm">/</span>
                    <input
                      type="number"
                      value={s.maxScore}
                      onChange={e => updateSubject(idx, 'maxScore', +e.target.value)}
                      className="w-16 bg-white dark:bg-slate-900 rounded-lg p-2 text-center font-bold text-sm border dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  {s.grade && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                      s.grade === 'A+' || s.grade === 'A' ? 'bg-green-100 text-green-600' : s.grade === 'B' ? 'bg-blue-100 text-blue-600' : s.grade === 'C' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                    }`}>{s.grade}</span>
                  )}
                  <button onClick={() => removeSubject(idx)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addSubject}
                className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-gray-400 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Add Subject
              </button>
            </div>

            <button onClick={analyze} disabled={loading || !examName.trim() || validSubjects.length === 0}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-[0.98]">
              {loading ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
              {loading ? 'Analyzing...' : 'Analyze Performance'}
            </button>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center border dark:border-slate-800">
              <div className="w-24 h-24 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
              <p className="text-xl font-black dark:text-white animate-pulse">Analyzing Your Scores...</p>
              <p className="text-gray-400 mt-2 text-sm">Our AI is finding patterns in your performance</p>
            </div>
          ) : !report ? (
            <div className="h-[500px] bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10">
              <Target size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold dark:text-white">Ready to Analyze</h3>
              <p className="text-gray-500 max-w-sm mt-2">Enter your subjects and scores to get an AI-powered performance breakdown.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              {/* Score Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Overall</p>
                  <p className={`text-4xl font-black ${report.overallPercent >= 70 ? 'text-green-500' : report.overallPercent >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{report.overallPercent}%</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subjects</p>
                  <p className="text-4xl font-black text-gray-900 dark:text-white">{report.subjects.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Best In</p>
                  <p className="text-lg font-black text-brand-600 truncate">{report.subjects.reduce((a, b) => (a.score / a.maxScore) > (b.score / b.maxScore) ? a : b).subject}</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Score Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700 }} />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, idx) => <Cell key={idx} fill={getBarColor(entry.score)} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-3xl p-6">
                  <h3 className="text-xs font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 size={14} /> Strengths</h3>
                  <ul className="space-y-2">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-green-800 dark:text-green-300 font-medium flex gap-2">
                        <span className="text-green-400">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-6">
                  <h3 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertCircle size={14} /> Weaknesses</h3>
                  <ul className="space-y-2">
                    {report.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-red-800 dark:text-red-300 font-medium flex gap-2">
                        <span className="text-red-400">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improvement Plan */}
              <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30 rounded-3xl p-6">
                <button onClick={() => setExpandedPlan(!expandedPlan)} className="w-full flex justify-between items-center">
                  <h3 className="text-xs font-black text-brand-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} /> AI Improvement Plan</h3>
                  {expandedPlan ? <ChevronUp size={16} className="text-brand-600" /> : <ChevronDown size={16} className="text-brand-600" />}
                </button>
                {expandedPlan && (
                  <ol className="mt-4 space-y-3">
                    {report.improvementPlan.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-brand-900 dark:text-brand-200 font-medium">
                        <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyzer;
