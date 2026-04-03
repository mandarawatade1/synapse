import React, { useState, useRef, useEffect } from 'react';
import { Brain, Loader2, Sparkles, ChevronRight, CheckCircle2, XCircle, Trophy, Clock, UploadCloud, X, File as FileIcon, RotateCcw, History, ArrowRight } from 'lucide-react';
import { generateQuiz } from '../src/services/geminiService';
import { saveQuizSession, getQuizHistory } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { useUser } from '../App';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuizQuestion, QuizSession } from '../types';

const QuizMaker: React.FC = () => {
  const { user } = useUser();
  const [phase, setPhase] = useState<'input' | 'loading' | 'taking' | 'results'>('input');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(10);
  const [noteText, setNoteText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const [history, setHistory] = useState<QuizSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const autoStarted = useRef(false);

  useEffect(() => {
    if (location.state?.autoStart && !autoStarted.current) {
      autoStarted.current = true;
      const stateTopic = location.state.topic || '';
      const stateDiff = location.state.difficulty || 'Mixed';
      const stateCount = location.state.count || 10;
      
      setTopic(stateTopic);
      setDifficulty(stateDiff);
      setCount(stateCount);
      
      const autoStartQuiz = async () => {
        if (!stateTopic.trim()) return;
        setPhase('loading');
        try {
          const qs = await generateQuiz(stateTopic, '', stateDiff, stateCount);
          setQuestions(qs);
          setCurrentQ(0);
          setScore(0);
          setAnswers(new Array(qs.length).fill(null));
          setSelected(null);
          setAnswered(false);
          setPhase('taking');
        } catch (err) {
          console.error(err);
          alert('Failed to generate quiz. Please try again.');
          setPhase('input');
        }
      };
      
      autoStartQuiz();
      
      // Clean up state so refresh doesn't auto-start again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (auth.currentUser) {
      getQuizHistory(auth.currentUser.uid).then(setHistory).catch(() => { });
    }
  }, [phase, user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setNoteText(reader.result as string);
      reader.readAsText(f);
    }
  };

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setPhase('loading');
    try {
      const qs = await generateQuiz(topic, noteText, difficulty, count);
      setQuestions(qs);
      setCurrentQ(0);
      setScore(0);
      setAnswers(new Array(qs.length).fill(null));
      setSelected(null);
      setAnswered(false);
      setPhase('taking');
    } catch (err) {
      console.error(err);
      alert('Failed to generate quiz. Please try again.');
      setPhase('input');
    }
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    if (idx === questions[currentQ].correct) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setPhase('results');
    if (auth.currentUser) {
      const session: QuizSession = {
        id: `quiz_${Date.now()}`,
        topic,
        difficulty,
        questions,
        score,
        total: questions.length,
        createdAt: new Date().toISOString()
      };
      try { await saveQuizSession(auth.currentUser.uid, session); } catch (e) { console.error(e); }
    }
  };

  const resetQuiz = () => {
    setPhase('input');
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setAnswers([]);
    setSelected(null);
    setAnswered(false);
  };

  const q = questions[currentQ];
  const progress = questions.length > 0 ? ((currentQ + (answered ? 1 : 0)) / questions.length) * 100 : 0;
  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Quiz Maker <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">AI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Generate quizzes on any topic with AI-powered questions.</p>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <History size={16} /> History
        </button>
      </header>

      {showHistory && (
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Past Quizzes</h3>
          {history.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {history.map(h => (
                <div key={h.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                  <div>
                    <p className="font-bold dark:text-white">{h.topic}</p>
                    <p className="text-xs text-gray-400">{h.difficulty} • {new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-lg font-black ${h.score / h.total >= 0.7 ? 'text-green-500' : h.score / h.total >= 0.4 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {h.score}/{h.total}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">No past quizzes found.</p>
              <p className="text-xs text-slate-400 mt-1">Take your first quiz to see it here!</p>
            </div>
          )}
        </div>
      )}

      {/* INPUT PHASE */}
      {phase === 'input' && (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 sm:p-10 space-y-8 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Topic *</label>
              <input
                autoFocus
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Transformers in NLP, React Hooks, Data Structures..."
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-brand-600 outline-none text-lg font-bold dark:text-white transition-all"
                onKeyDown={e => e.key === 'Enter' && startQuiz()}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Mixed', 'Easy', 'Medium', 'Hard'].map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`w-full py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 ${difficulty === d
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'border-transparent bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                    >{d}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Questions: {count}</label>
                <input type="range" min={5} max={15} value={count} onChange={e => setCount(+e.target.value)}
                  className="w-full accent-brand-600" />
              </div>
            </div>

            <button onClick={startQuiz} disabled={!topic.trim()}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-[0.98]">
              <Sparkles size={22} /> Generate Quiz
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 sm:p-10 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optional: Paste Notes or Upload File</label>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Paste your study notes here so the AI bases questions on YOUR material..."
                className="w-full h-48 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm dark:text-white resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <UploadCloud size={16} /> Upload Notes
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.pdf,.md" onChange={handleFileUpload} />
              {file && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-700 dark:text-brand-300 text-xs font-bold">
                  <FileIcon size={12} /> {file.name}
                  <button onClick={() => { setFile(null); setNoteText(''); }} className="ml-1 hover:text-red-500"><X size={12} /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOADING PHASE */}
      {phase === 'loading' && (
        <div className="h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center border dark:border-slate-800 animate-in fade-in duration-500">
          <div className="w-24 h-24 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-black dark:text-white animate-pulse">Generating Quiz...</p>
          <p className="text-gray-400 mt-2 text-sm">Creating {count} {difficulty} questions about {topic}</p>
        </div>
      )}

      {/* TAKING PHASE */}
      {phase === 'taking' && q && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-sm font-black text-gray-500">{currentQ + 1}/{questions.length}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 sm:p-10 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-lg">{difficulty}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question {currentQ + 1}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold dark:text-white mb-8 leading-relaxed">{q.question}</h2>

            <div className="grid gap-4">
              {q.options.map((opt, idx) => {
                let style = 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 text-gray-700 dark:text-gray-200';
                if (answered) {
                  if (idx === q.correct) style = 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300';
                  else if (idx === selected) style = 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300';
                  else style = 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-800 text-gray-400 opacity-50';
                }
                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left font-bold transition-all ${style}`}>
                    <span className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-current flex items-center justify-center text-sm font-black flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answered && idx === q.correct && <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />}
                    {answered && idx === selected && idx !== q.correct && <XCircle size={20} className="text-red-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-6 p-5 bg-brand-50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <p className="text-xs font-black text-brand-600 uppercase tracking-widest mb-2">Explanation</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{q.explanation}</p>
              </div>
            )}

            {answered && (
              <button onClick={nextQuestion}
                className="w-full mt-6 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95">
                {currentQ < questions.length - 1 ? <>Next Question <ChevronRight size={18} /></> : <>See Results <Trophy size={18} /></>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-10 text-center shadow-sm">
            <div className="relative inline-block mb-6">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-black border-8 ${scorePercent >= 70 ? 'border-green-500 text-green-600' : scorePercent >= 40 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}>
                {scorePercent}%
              </div>
            </div>
            <h2 className="text-3xl font-black dark:text-white mb-2">
              {scorePercent >= 80 ? 'Excellent!' : scorePercent >= 60 ? 'Good Job!' : scorePercent >= 40 ? 'Keep Practicing' : 'Needs Work'}
            </h2>
            <p className="text-gray-500 font-medium">You scored <span className="font-black text-gray-900 dark:text-white">{score}</span> out of <span className="font-black text-gray-900 dark:text-white">{questions.length}</span> on {topic}</p>

            <div className="flex justify-center gap-4 mt-8">
              <button onClick={resetQuiz} className="px-6 py-3 bg-gray-100 dark:bg-slate-800 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                <RotateCcw size={16} /> New Quiz
              </button>
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-black dark:text-white mb-4">Question Review</h3>
            {questions.map((q, i) => (
              <div key={q.id} className={`p-4 rounded-2xl border ${answers[i] === q.correct ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'}`}>
                <div className="flex items-start gap-3">
                  {answers[i] === q.correct ? <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" /> : <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="font-bold text-sm dark:text-white">{q.question}</p>
                    <p className="text-xs text-gray-500 mt-1">Your answer: {answers[i] !== null ? q.options[answers[i]!] : 'Skipped'} | Correct: {q.options[q.correct]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizMaker;
