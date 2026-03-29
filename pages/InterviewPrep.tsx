import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Sparkles, ChevronRight, CheckCircle2, XCircle, Trophy, Clock, RotateCcw, History, ArrowRight, MessageSquare } from 'lucide-react';
import { generateInterviewQuestions, analyzeInterviewResponse } from '../src/services/geminiService';
import { saveInterviewSession, getInterviewHistory } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { useUser } from '../App';
import { InterviewQuestion, InterviewSession } from '../types';

const InterviewPrep: React.FC = () => {
  const { user } = useUser();
  const [phase, setPhase] = useState<'input' | 'loading' | 'taking' | 'results'>('input');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [response, setResponse] = useState('');
  const [responses, setResponses] = useState<{ questionId: string; response: string; feedback: string; score: number }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      getInterviewHistory(auth.currentUser.uid).then(setHistory).catch(() => { });
    }
  }, [phase]);

  const startInterview = async () => {
    if (!role.trim()) return;
    setPhase('loading');
    try {
      const qs = await generateInterviewQuestions(role, difficulty, count);
      setQuestions(qs);
      setCurrentQ(0);
      setResponses([]);
      setResponse('');
      setPhase('taking');
    } catch (err) {
      console.error(err);
      alert('Failed to generate interview questions. Please try again.');
      setPhase('input');
    }
  };

  const submitResponse = async () => {
    if (!response.trim()) return;
    setAnalyzing(true);
    try {
      const feedback = await analyzeInterviewResponse(questions[currentQ].question, response, questions[currentQ].expectedAnswer);
      const newResponse = {
        questionId: questions[currentQ].id,
        response,
        feedback: feedback.feedback,
        score: feedback.score
      };
      setResponses([...responses, newResponse]);
      setResponse('');
      setAnalyzing(false);
      nextQuestion();
    } catch (err) {
      console.error(err);
      alert('Failed to analyze response. Please try again.');
      setAnalyzing(false);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setPhase('results');
    const overallScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
    if (auth.currentUser) {
      const session: InterviewSession = {
        id: `interview_${Date.now()}`,
        role,
        difficulty,
        questions,
        responses,
        overallScore: Math.round(overallScore),
        createdAt: new Date().toISOString()
      };
      try { await saveInterviewSession(auth.currentUser.uid, session); } catch (e) { console.error(e); }
    }
  };

  const reset = () => {
    setPhase('input');
    setQuestions([]);
    setCurrentQ(0);
    setResponse('');
    setResponses([]);
  };

  if (phase === 'input') {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-brand-600" />
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Interview Prep</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Practice with AI-generated interview questions tailored to your target role.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border dark:border-slate-700">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Software Engineer, Data Analyst"
                className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Number of Questions</label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>

            <button
              onClick={startInterview}
              disabled={!role.trim()}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              Start Interview Practice
            </button>
          </div>

          {history.length > 0 && (
            <div className="mt-8 pt-8 border-t dark:border-slate-700">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold"
              >
                <History className="w-5 h-5" />
                View Previous Sessions ({history.length})
              </button>

              {showHistory && (
                <div className="mt-4 space-y-3">
                  {history.slice(0, 5).map((session) => (
                    <div key={session.id} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{session.role}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{session.difficulty} • {session.questions.length} questions</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-brand-600">{session.overallScore}/10</p>
                          <p className="text-xs text-gray-500">{new Date(session.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generating Interview Questions</h2>
        <p className="text-gray-600 dark:text-gray-400">Preparing personalized questions for {role}...</p>
      </div>
    );
  }

  if (phase === 'taking') {
    const currentQuestion = questions[currentQ];
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border dark:border-slate-700">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Question {currentQ + 1} of {questions.length}</span>
              <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-full text-sm font-bold">
                {currentQuestion.category}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{currentQuestion.question}</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Tips:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {currentQuestion.tips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your response here..."
              className="w-full h-32 px-4 py-3 border dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={submitResponse}
                disabled={!response.trim() || analyzing}
                className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-3"
              >
                {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {analyzing ? 'Analyzing...' : 'Submit Response'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const overallScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Interview Complete!</h1>
          <div className="text-6xl font-black text-brand-600 mb-2">{Math.round(overallScore)}/10</div>
          <p className="text-gray-600 dark:text-gray-400">Overall Performance Score</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border dark:border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Detailed Feedback</h2>
          <div className="space-y-6">
            {responses.map((resp, idx) => {
              const question = questions.find(q => q.id === resp.questionId);
              return (
                <div key={idx} className="border-b dark:border-slate-700 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white">{question?.question}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Score:</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-bold ${
                        resp.score >= 8 ? 'bg-green-100 text-green-800' :
                        resp.score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {resp.score}/10
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Your Response:</strong> {resp.response}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <p className="text-sm text-blue-800 dark:text-blue-200"><strong>Feedback:</strong> {resp.feedback}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-5 h-5" />
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewPrep;