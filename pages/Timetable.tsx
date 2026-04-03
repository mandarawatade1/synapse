import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, Clock, MapPin, ImagePlus, Loader2 } from 'lucide-react';
import { parseTimetableImage } from '../src/services/geminiService';

interface ClassEntry {
  id: string;
  subject: string;
  time: string;
  endTime: string;
  location: string;
  color: string;
}

type DaySchedule = ClassEntry[];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = [
  'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800',
  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
];

const Timetable: React.FC = () => {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const saved = localStorage.getItem('timetable');
    if (saved) return JSON.parse(saved);
    return DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
  });
  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date().getDay();
    return today >= 1 && today <= 6 ? DAYS[today - 1] : DAYS[0];
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [isParsingImage, setIsParsingImage] = useState(false);

  useEffect(() => {
    localStorage.setItem('timetable', JSON.stringify(schedule));
  }, [schedule]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingImage(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result?.toString().split(',')[1];
        if (!base64Data) throw new Error("Failed to read file");

        const parsedData = await parseTimetableImage({
          mimeType: file.type,
          data: base64Data
        });

        if (parsedData) {
          setSchedule(prev => {
            const next = { ...prev };
            let colorIdx = 0;
            
            // Merge parsed data into existing schedule
            for (const day of Object.keys(parsedData)) {
              if (DAYS.includes(day) && Array.isArray(parsedData[day])) {
                const newClasses = parsedData[day].map((cls: any) => ({
                  id: cls.id || `cls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  subject: cls.subject || 'Unknown Class',
                  time: cls.time || '09:00',
                  endTime: cls.endTime || '10:00',
                  location: cls.location || '',
                  color: COLORS[colorIdx++ % COLORS.length]
                }));
                
                next[day] = [...(next[day] || []), ...newClasses].sort((a, b) => a.time.localeCompare(b.time));
              }
            }
            return next;
          });
        }
      };
      reader.onerror = () => {
        console.error("Error reading file");
        setIsParsingImage(false);
      }
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to parse timetable image", error);
    } finally {
      // the actual finally needs to happen in the onload, but this resets the input at least
      e.target.value = '';
      setTimeout(() => setIsParsingImage(false), 3000); // safety fallback
    }
  };

  const addClass = () => {
    const newClass: ClassEntry = {
      id: `cls_${Date.now()}`,
      subject: '',
      time: '09:00',
      endTime: '10:00',
      location: '',
      color: COLORS[schedule[activeDay].length % COLORS.length]
    };
    setSchedule(prev => ({
      ...prev,
      [activeDay]: [...prev[activeDay], newClass].sort((a, b) => a.time.localeCompare(b.time))
    }));
    setEditing(newClass.id);
  };

  const updateClass = (id: string, field: string, value: string) => {
    setSchedule(prev => ({
      ...prev,
      [activeDay]: prev[activeDay].map(c => c.id === id ? { ...c, [field]: value } : c).sort((a, b) => a.time.localeCompare(b.time))
    }));
  };

  const deleteClass = (id: string) => {
    setSchedule(prev => ({
      ...prev,
      [activeDay]: prev[activeDay].filter(c => c.id !== id)
    }));
    if (editing === id) setEditing(null);
  };

  const totalClasses = Object.values(schedule).reduce((a, d) => a + d.length, 0);
  const todayClasses = schedule[activeDay]?.length || 0;

  // Current day highlight
  const todayIdx = new Date().getDay();
  const todayName = todayIdx >= 1 && todayIdx <= 6 ? DAYS[todayIdx - 1] : null;

  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          Timetable <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">Schedule</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Manage your weekly class schedule.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl flex items-center justify-center"><CalendarDays size={22} /></div>
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{totalClasses}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Classes/Week</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-center items-center gap-3 relative overflow-hidden group">
          {isParsingImage ? (
            <div className="flex flex-col items-center justify-center h-full text-brand-600">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-xs font-bold animate-pulse">Scanning Timetable...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ImagePlus size={22} /></div>
              <div className="text-center">
                <p className="text-sm font-black text-gray-900 dark:text-white">Auto-Build</p>
                <p className="text-[10px] font-bold text-gray-400">Upload Image</p>
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" title="Upload Timetable Image" disabled={isParsingImage} />
            </>
          )}
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {DAYS.map(day => (
          <button key={day} onClick={() => { setActiveDay(day); setEditing(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all relative ${activeDay === day
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}>
            {day.slice(0, 3)}
            {todayName === day && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-950"></span>}
          </button>
        ))}
      </div>

      {/* Schedule */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm space-y-4">
        {schedule[activeDay].length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays size={40} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-bold">No classes on {activeDay}</p>
            <p className="text-gray-400 text-sm mt-1">Add your first class to get started.</p>
          </div>
        ) : (
          schedule[activeDay].map((cls, idx) => (
            <div key={cls.id} className={`p-5 rounded-2xl border-2 transition-all ${cls.color} ${editing === cls.id ? 'ring-2 ring-brand-500' : ''}`}>
              {editing === cls.id ? (
                <div className="space-y-3">
                  <input autoFocus placeholder="Subject name" value={cls.subject}
                    onChange={e => updateClass(cls.id, 'subject', e.target.value)}
                    className="w-full p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border-none outline-none font-bold text-sm" />
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <input type="time" value={cls.time} onChange={e => updateClass(cls.id, 'time', e.target.value)}
                        className="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg border-none outline-none font-bold text-xs" />
                      <span>–</span>
                      <input type="time" value={cls.endTime} onChange={e => updateClass(cls.id, 'endTime', e.target.value)}
                        className="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg border-none outline-none font-bold text-xs" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <MapPin size={14} />
                      <input placeholder="Room / Location" value={cls.location}
                        onChange={e => updateClass(cls.id, 'location', e.target.value)}
                        className="flex-1 p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg border-none outline-none font-bold text-xs" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setEditing(null)} className="text-xs font-bold text-brand-600 hover:underline">Done</button>
                    <button onClick={() => deleteClass(cls.id)} className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setEditing(cls.id)} className="cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs font-black">{cls.time}</p>
                      <p className="text-[10px] opacity-70">{cls.endTime}</p>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{cls.subject || 'Untitled Class'}</p>
                      {cls.location && <p className="text-[10px] font-medium opacity-70 flex items-center gap-1"><MapPin size={10} /> {cls.location}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        <button onClick={addClass}
          className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-gray-400 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center justify-center gap-2">
          <Plus size={16} /> Add Class
        </button>
      </div>
    </div>
  );
};

export default Timetable;
