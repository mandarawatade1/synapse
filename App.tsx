
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Layout, Briefcase, MessageSquare, Map, FileText, Settings, BarChart, LogOut, User as UserIcon, Sparkles, Brain, TrendingUp, BookOpen, AudioLines, Calculator, Timer, CalendarDays, PanelLeftClose, PanelLeft } from 'lucide-react';
import { UserProfile } from './types';
import { auth, googleProvider, getUserProfile, saveUserProfile } from './src/services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { isAdmin } from './src/config/adminEmails';

// Pages
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
import GPACalculator from './pages/GPACalculator';
import PomodoroTimer from './pages/PomodoroTimer';
import Timetable from './pages/Timetable';
import InterviewPrep from './pages/InterviewPrep';

// Contexts
const ThemeContext = createContext({ isDark: false, toggle: () => { } });
const SidebarContext = createContext({ isCollapsed: false, toggleSidebar: () => { } });
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
export const useSidebar = () => useContext(SidebarContext);
export const useUser = () => useContext(UserContext);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, logout } = useUser();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const isActive = (path: string) => location.pathname === path;

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { path: '/dashboard', icon: Layout, label: 'Dashboard' },
      ],
    },
    {
      label: 'TOOLS',
      items: [
        { path: '/advisor', icon: MessageSquare, label: 'Study Buddy' },
        { path: '/quiz', icon: Brain, label: 'Quiz Maker' },
        { path: '/notes', icon: BookOpen, label: 'Notes' },
        { path: '/transcript', icon: AudioLines, label: 'Transcripts' },
        { path: '/timer', icon: Timer, label: 'Focus Timer' },
      ],
    },
    {
      label: 'TRACK',
      items: [
        { path: '/performance', icon: TrendingUp, label: 'Performance' },
        { path: '/gpa', icon: Calculator, label: 'GPA Calculator' },
        { path: '/timetable', icon: CalendarDays, label: 'Timetable' },
      ],
    },
    {
      label: 'BUILD',
      items: [
        { path: '/planner', icon: Settings, label: 'Exam Prep' },
        { path: '/roadmap', icon: Map, label: 'Skill Roadmap' },
        { path: '/resume', icon: FileText, label: 'Resume Builder' },
        { path: '/interview', icon: MessageSquare, label: 'Interview Prep' },
      ],
    },
  ];

  if (user && isAdmin(user.email)) {
    navGroups.push({
      label: 'ADMIN',
      items: [{ path: '/admin', icon: BarChart, label: 'Admin Panel' }],
    });
  }

  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/profile-setup') return null;

  return (
    <div
      className="bg-white dark:bg-slate-900 border-r dark:border-slate-800 h-screen sticky top-0 flex flex-col overflow-hidden"
      style={{
        width: isCollapsed ? '80px' : '320px',
        minWidth: isCollapsed ? '80px' : '320px',
        transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Logo + Toggle */}
      <div
        className={`border-b dark:border-slate-800 flex ${isCollapsed ? 'flex-col items-center gap-3' : 'items-center justify-between'}`}
        style={{ padding: isCollapsed ? '20px 12px' : '32px', transition: 'padding 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Synapse Logo" className={`${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'} object-contain flex-shrink-0 group-hover:scale-110 transition-all duration-300 drop-shadow-md`} />
          {!isCollapsed && (
            <span className="text-3xl font-black text-brand-600 dark:text-brand-400 font-logo whitespace-nowrap">
              Synapse
            </span>
          )}
        </Link>

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-all duration-300 flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: isCollapsed ? '16px 12px' : '24px', transition: 'padding 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {navGroups.map((group, groupIndex) => (
          <div key={group.label}>
            {/* Group separator line (between groups, not before the first) */}
            {groupIndex > 0 && (
              <div
                className="mx-auto my-2"
                style={{
                  width: isCollapsed ? '32px' : 'calc(100% - 32px)',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.18), transparent)',
                  transition: 'width 0.35s ease',
                }}
              />
            )}

            {/* Group label */}
            <p
              className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden select-none"
              style={{
                opacity: isCollapsed ? 0 : 1,
                height: isCollapsed ? 0 : 'auto',
                marginBottom: isCollapsed ? 0 : '8px',
                marginTop: isCollapsed ? 0 : (groupIndex === 0 ? '0' : '12px'),
                marginLeft: isCollapsed ? 0 : '16px',
                transition: 'opacity 0.2s ease, height 0.3s ease, margin 0.3s ease',
              }}
            >
              {group.label}
            </p>

            {/* Group items */}
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={`relative flex items-center rounded-xl transition-all duration-300 group overflow-hidden ${isActive(item.path)
                    ? 'text-brand-700 dark:text-brand-300 font-bold sidebar-active-item'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  style={{
                    padding: isCollapsed ? '12px' : '12px 20px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: isCollapsed ? '0' : '16px',
                    background: isActive(item.path)
                      ? 'linear-gradient(90deg, rgba(124,58,237,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 100%)'
                      : undefined,
                    transition: 'padding 0.35s cubic-bezier(0.4, 0, 0.2, 1), gap 0.35s ease, background 0.3s ease',
                  }}
                >
                  {/* Left accent bar for active item */}
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                    style={{
                      width: isActive(item.path) ? '3px' : '0px',
                      height: isActive(item.path) ? '60%' : '0%',
                      background: 'linear-gradient(180deg, #a78bfa, #7c3aed)',
                      boxShadow: isActive(item.path) ? '0 0 12px 2px rgba(124,58,237,0.5)' : 'none',
                      transition: 'width 0.3s ease, height 0.3s ease, box-shadow 0.3s ease',
                    }}
                  />
                  <item.icon
                    size={22}
                    className={`flex-shrink-0 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`}
                  />
                  <span
                    className="text-sm tracking-wide whitespace-nowrap"
                    style={{
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : 'auto',
                      overflow: 'hidden',
                      transition: 'opacity 0.2s ease, width 0.3s ease',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50" style={{ padding: isCollapsed ? '16px 12px' : '24px', transition: 'padding 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>

        {/* User card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 shadow-sm overflow-hidden" style={{ padding: isCollapsed ? '10px' : '16px', transition: 'padding 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div className="flex items-center overflow-hidden" style={{ gap: isCollapsed ? '0' : '12px', justifyContent: isCollapsed ? 'center' : 'flex-start', transition: 'gap 0.35s ease' }}>
            <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-300 flex-shrink-0 shadow-inner" title={isCollapsed ? (user?.name || 'Guest') : undefined}>
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            {!isCollapsed && (
              <>
                <div className="truncate flex-1">
                  <p className="text-sm font-black truncate dark:text-white tracking-tight">{user?.name || 'Guest'}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{user?.targetRole || 'Explorer'}</p>
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>

          {user?.targetRole && !isCollapsed && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg mt-3 ai-badge-glow">
              <Sparkles size={12} className="text-brand-400 ai-badge-sparkle" />
              <span className="text-[10px] font-black text-brand-300 uppercase tracking-tighter">AI Optimized</span>
            </div>
          )}
        </div>
      </div>
    </div>
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
  const [isDark] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
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
      <ThemeContext.Provider value={{ isDark, toggle: () => {} }}>
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
        <Router>
          <div className="flex min-h-screen transition-colors">
            <Sidebar />
            <main className="flex-1 bg-gray-50 dark:bg-slate-950 overflow-auto scroll-smooth" style={{ transition: 'margin 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
                <Route path="/gpa" element={<ProtectedRoute><GPACalculator /></ProtectedRoute>} />
                <Route path="/timer" element={<ProtectedRoute><PomodoroTimer /></ProtectedRoute>} />
                <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
                <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
        </SidebarContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};

export default App;
