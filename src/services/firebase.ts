import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALHvP6odpJdSacN9_CGTikhMmRhMHjRDs",
  authDomain: "pathpilot-ai-3a774.firebaseapp.com",
  projectId: "pathpilot-ai-3a774",
  storageBucket: "pathpilot-ai-3a774.firebasestorage.app",
  messagingSenderId: "944707759538",
  appId: "1:944707759538:web:8b82987c6c782cd2de08ab",
  measurementId: "G-KV3M4BKENG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Firestore Helpers
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc, query, orderBy, addDoc } from "firebase/firestore";
import { UserProfile, QuestProgress, QuizSession, PerformanceReport, SavedNote, SavedTranscript, InterviewSession } from "../../types";

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
};

export const saveUserProfile = async (userId: string, profile: UserProfile) => {
  await setDoc(doc(db, "users", userId), profile, { merge: true });
};

export const updateUserQuestProgress = async (userId: string, progress: QuestProgress) => {
  await updateDoc(doc(db, "users", userId), { questProgress: progress });
};

// ── Quiz CRUD ──
export const saveQuizSession = async (userId: string, session: QuizSession) => {
  await setDoc(doc(db, "quizzes", userId, "sessions", session.id), session);
};

export const getQuizHistory = async (userId: string): Promise<QuizSession[]> => {
  const snap = await getDocs(collection(db, "quizzes", userId, "sessions"));
  return snap.docs.map(d => d.data() as QuizSession).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// ── Performance CRUD ──
export const savePerformanceReport = async (userId: string, report: PerformanceReport) => {
  await setDoc(doc(db, "performance", userId, "reports", report.id), report);
};

export const getPerformanceHistory = async (userId: string): Promise<PerformanceReport[]> => {
  const snap = await getDocs(collection(db, "performance", userId, "reports"));
  return snap.docs.map(d => d.data() as PerformanceReport).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// ── Notes CRUD ──
export const saveNote = async (userId: string, note: SavedNote) => {
  await setDoc(doc(db, "notes", userId, "items", note.id), note);
};

export const getNotes = async (userId: string): Promise<SavedNote[]> => {
  const snap = await getDocs(collection(db, "notes", userId, "items"));
  return snap.docs.map(d => d.data() as SavedNote).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const deleteNote = async (userId: string, noteId: string) => {
  await deleteDoc(doc(db, "notes", userId, "items", noteId));
};

// ── Transcript CRUD ──
export const saveTranscriptDoc = async (userId: string, transcript: SavedTranscript) => {
  await setDoc(doc(db, "transcripts", userId, "items", transcript.id), transcript);
};

export const getTranscripts = async (userId: string): Promise<SavedTranscript[]> => {
  const snap = await getDocs(collection(db, "transcripts", userId, "items"));
  return snap.docs.map(d => d.data() as SavedTranscript).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const deleteTranscript = async (userId: string, transcriptId: string) => {
  await deleteDoc(doc(db, "transcripts", userId, "items", transcriptId));
};

export const saveInterviewSession = async (userId: string, session: InterviewSession) => {
  await setDoc(doc(db, "interviewSessions", userId, "items", session.id), session);
};

export const getInterviewHistory = async (userId: string): Promise<InterviewSession[]> => {
  const snap = await getDocs(collection(db, "interviewSessions", userId, "items"));
  return snap.docs.map(d => d.data() as InterviewSession).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
