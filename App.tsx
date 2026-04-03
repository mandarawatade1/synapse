import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Layout, Briefcase, MessageSquare, Map, FileText, Settings, BarChart, LogOut, User as UserIcon, Sparkles, Brain, TrendingUp, BookOpen, AudioLines, Calculator, Timer, CalendarDays, PanelLeftClose, PanelLeft, Youtube, ChevronDown, Sun, Moon } from 'lucide-react';
import { UserProfile } from './types';
import { auth, googleProvider, getUserProfile, saveUserProfile } from './src/services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { isAdmin } from './src/config/adminEmails';
import { AnimatePresence } from 'framer-motion';

// Pages
import LoadingScreen from './src/components/LoadingScreen';
import Landing from './pages/Landing';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import InternshipPortal from './pages/InternshipPortal';
import AdvisorChat from './pages/AdvisorChat';
import PrepPlanner from './pages/PrepPlanner';
import Roadmap from './pages/Roadmap';
import ResumeBuilder from './pages/ResumeBuilder';
import AdminPanel from './pages/AdminPanel';
import ProfileSetup from './pages/ProfileSetup';
import QuizMaker from './pages/QuizMaker';
import PerformanceAnalyzer from './pages/PerformanceAnalyzer';
import NotesManager from './pages/NotesManager';
import TranscriptGenerator from './pages/TranscriptGenerator';
import VideoTranscriptGenerator from './pages/VideoTranscriptGenerator';
import GPACalculator from './pages/GPACalculator';
import PomodoroTimer from './pages/PomodoroTimer';
import Timetable from './pages/Timetable';
import InterviewPrep from './pages/InterviewPrep';
import Flashcards from './pages/Flashcards';
import AllTools from './pages/AllTools';
import Dock from './src/components/Dock';
import DashboardHeader from './src/components/DashboardHeader';


// Contexts
const ThemeContext = createContext({ isDark: false, toggleTheme: () => { } });
const UserContext = createContext<{
  user: UserProfile | null,
  login: (u?: UserProfile) => void,
  logout: () => void,
  updateProfile: (u: UserProfile) => void
}>({
  user: null,
  login: () => { },
  logout: () => { },
  updateProfile: () => { }
});

export const useTheme = () => useContext(ThemeContext);
export const useUser = () => useContext(UserContext);

const GlobalUIOverlays = ({ isInitialLoading }: { isInitialLoading?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide Dock and TopNav while loading or on auth/marketing pages
  if (isInitialLoading || ['/', '/login', '/profile-setup'].includes(location.pathname)) return null;

  const dockItems = [
    { label: 'Dashboard', icon: <Layout size={20} />, onClick: () => navigate('/dashboard') },
    { label: 'Study Buddy', icon: <MessageSquare size={20} />, onClick: () => navigate('/advisor') },
    { label: 'Notes', icon: <BookOpen size={20} />, onClick: () => navigate('/notes') },
    { label: 'Quiz Maker', icon: <Brain size={20} />, onClick: () => navigate('/quiz') },
    { label: 'Flashcards', icon: <Sparkles size={20} />, onClick: () => navigate('/flashcards') },
    { label: 'Timetable', icon: <CalendarDays size={20} />, onClick: () => navigate('/timetable') },
    { label: 'All Tools', icon: <Settings size={20} />, onClick: () => navigate('/tools') },
  ];

  return (
    <>
      <DashboardHeader />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] w-full md:w-[60%] h-8 group hover:h-32 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
        {/* Subtle iOS-like home indicator when hidden */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 rounded-full border border-border-subtle bg-surface/50 backdrop-blur-md group-hover:opacity-0 transition-opacity duration-300"></div>
        
        {/* The Dock container slides up gracefully */}
        <div className="absolute -bottom-32 left-0 w-full group-hover:bottom-4 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
          <Dock
            items={dockItems}
            panelHeight={64}
            baseItemSize={48}
            magnification={72}
            className="bg-white/70 dark:bg-[#0b0c10]/70 backdrop-blur-3xl shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-black/10 dark:border-white/10 rounded-3xl text-text-primary dark:text-white"
          />
        </div>
      </div>
    </>
  );
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin(user.email)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme-preference');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme-preference', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    // Determine a minimum time to show the loading screen (e.g. 2.2s)
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 2200));

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUser(profile);
        } else {
          // New user - pre-fill from Google
          setUser({
            name: firebaseUser.displayName || 'Explorer',
            email: firebaseUser.email || '',
            targetRole: '',
            skills: [],
            graduationYear: '',
            currentLevel: 'Beginner',
            avatar: firebaseUser.photoURL || undefined
          });
        }
      } else {
        setUser(null);
      }
      
      // Hide loading screen after minimum display time AND Firebase check resolves
      minLoadTime.then(() => setIsInitialLoading(false));
    });
    return () => unsubscribe();
  }, []);

  const login = async (u?: UserProfile) => {
    // If a profile is passed (dev/mock), use it. Otherwise trigger Google Auth.
    if (u) {
      setUser(u);
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.clear();
  };

  const updateProfile = async (u: UserProfile) => {
    if (!auth.currentUser) return;
    await saveUserProfile(auth.currentUser.uid, u);
    setUser(u);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateProfile }}>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <AnimatePresence mode="wait">
            {isInitialLoading && <LoadingScreen key="loading-screen" />}
          </AnimatePresence>
          <Router>
            <div className="relative min-h-screen transition-colors bg-bg-base overflow-x-hidden flex flex-col">
              <GlobalUIOverlays isInitialLoading={isInitialLoading} />
              <main className="flex-1 w-full bg-bg-base text-text-primary overflow-auto scroll-smooth pb-32" style={{ backgroundColor: 'var(--bg-base)' }}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile-setup" element={<ProfileSetup />} />
                  <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                  <Route path="/internships" element={<ProtectedRoute><InternshipPortal /></ProtectedRoute>} />
                  <Route path="/advisor" element={<ProtectedRoute><AdvisorChat /></ProtectedRoute>} />
                  <Route path="/planner" element={<ProtectedRoute><PrepPlanner /></ProtectedRoute>} />
                  <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
                  <Route path="/resume" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
                  <Route path="/quiz" element={<ProtectedRoute><QuizMaker /></ProtectedRoute>} />
                  <Route path="/performance" element={<ProtectedRoute><PerformanceAnalyzer /></ProtectedRoute>} />
                  <Route path="/notes" element={<ProtectedRoute><NotesManager /></ProtectedRoute>} />
                  <Route path="/transcript" element={<ProtectedRoute><TranscriptGenerator /></ProtectedRoute>} />
                  <Route path="/video-transcript" element={<ProtectedRoute><VideoTranscriptGenerator /></ProtectedRoute>} />
                  <Route path="/gpa" element={<ProtectedRoute><GPACalculator /></ProtectedRoute>} />
                  <Route path="/timer" element={<ProtectedRoute><PomodoroTimer /></ProtectedRoute>} />
                  <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
                  <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
                  <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
                  <Route path="/tools" element={<ProtectedRoute><AllTools /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                </Routes>
              </main>
            </div>
          </Router>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};

export default App;
