import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, BookMarked, Volume2, VolumeX, CheckCircle2, Flame, Target, Coffee } from 'lucide-react';
import { db, collection, addDoc, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/auth/AuthGuard';
import { modules } from '../data/baccllb';

type TimerMode = 'micro' | 'pomodoro' | 'deep' | 'break';

const modeConfig = {
  micro: { label: 'Micro-start', minutes: 15, description: 'For low-energy starts and anxiety-friendly activation.' },
  pomodoro: { label: 'Pomodoro', minutes: 25, description: 'For standard focused revision.' },
  deep: { label: 'Deep work', minutes: 50, description: 'For A2 practice, MegaNotes and memo marking.' },
  break: { label: 'Recovery break', minutes: 5, description: 'Reset before the next round.' },
};

const sessionTypes = ['MegaNote build', 'Timed practice', 'Memo marking', 'Teach aloud', 'Mistake correction', 'Admin / submission'] as const;

const Timer: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(modeConfig.pomodoro.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [moduleId, setModuleId] = useState(modules[0].id);
  const [sessionType, setSessionType] = useState<typeof sessionTypes[number]>('Timed practice');
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const selectedModule = modules.find((module) => module.id === moduleId) || modules[0];
  const totalSeconds = modeConfig[mode].minutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const handleComplete = async () => {
    setIsActive(false);
    await saveSession(true);
    if (mode !== 'break') {
      setMode('break');
      setTimeLeft(modeConfig.break.minutes * 60);
    }
  };

  const saveSession = async (autoCompleted = false) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'sessions'), {
        userId: user.uid,
        moduleId,
        moduleName: selectedModule.shortName,
        durationMinutes: modeConfig[mode].minutes,
        mode,
        sessionType,
        reflection,
        autoCompleted,
        createdAt: new Date().toISOString(),
      });
      setSaved(true);
      setReflection('');
      setTimeout(() => setSaved(false), 1400);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sessions');
    }
  };

  const setTimerMode = (nextMode: TimerMode) => {
    setIsActive(false);
    setMode(nextMode);
    setTimeLeft(modeConfig[nextMode].minutes * 60);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modeConfig[mode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="text-center mb-10">
        <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">focus + logging</p>
        <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Pressure-Safe Study Timer</h1>
        <p className="text-slate-500 font-medium">Log module, session type and reflection so timer sessions become useful evidence, not just minutes.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
        <section className="glass rounded-[2.5rem] p-7 border-slate-200/50 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {(Object.keys(modeConfig) as TimerMode[]).map((item) => (
              <button key={item} onClick={() => setTimerMode(item)} className={`rounded-2xl border p-4 text-left transition-all ${mode === item ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon shadow-lg shadow-stellenbosch-maroon/20' : 'bg-white text-slate-600 border-slate-100 hover:border-stellenbosch-maroon/20'}`}>
                <p className="text-xs uppercase font-bold tracking-wider opacity-70">{modeConfig[item].minutes} min</p>
                <p className="font-bold">{modeConfig[item].label}</p>
              </button>
            ))}
          </div>

          <div className="relative mx-auto w-80 h-80 mb-10">
            <motion.div 
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-80 h-80 rounded-full bg-white border-4 border-white shadow-2xl flex flex-col items-center justify-center z-10 relative overflow-hidden"
            >
              <motion.div 
                animate={{ height: `${progress}%` }}
                className={`absolute bottom-0 left-0 right-0 w-full transition-all duration-1000 ${mode === 'break' ? 'bg-emerald-500 opacity-10' : 'bg-stellenbosch-maroon opacity-5'}`}
              />
              <div className="z-20 text-center px-8">
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-slate-400 mb-2 block">{modeConfig[mode].label}</span>
                <div className="text-7xl font-display text-slate-800 tracking-tighter tabular-nums">{formatTime(timeLeft)}</div>
                <p className="text-sm text-slate-500 mt-3">{modeConfig[mode].description}</p>
              </div>
            </motion.div>
            <FloatingIcon icon={<Target size={20}/>} top="-7%" left="8%" delay={0} />
            <FloatingIcon icon={<Flame size={20}/>} top="18%" right="-8%" delay={1} />
            <FloatingIcon icon={<BookMarked size={20}/>} bottom="-7%" left="18%" delay={2} />
          </div>

          <div className="flex justify-center gap-6">
            <button onClick={resetTimer} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-stellenbosch-maroon transition-all hover:scale-110 active:scale-90 shadow-sm"><RotateCcw size={24} /></button>
            <button onClick={() => setIsActive(!isActive)} className="w-24 h-24 rounded-full maroon-gradient text-white flex items-center justify-center shadow-xl shadow-stellenbosch-maroon/20 hover:scale-110 active:scale-95 transition-all">
              {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all hover:scale-110 active:scale-90 shadow-sm">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
          <h2 className="font-display text-3xl text-stellenbosch-maroon mb-6">Session setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">Module</span>
              <select value={moduleId} onChange={(event) => setModuleId(event.target.value)} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20">
                {modules.map((module) => <option key={module.id} value={module.id}>{module.shortName} ({module.code})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">Session type</span>
              <select value={sessionType} onChange={(event) => setSessionType(event.target.value as typeof sessionTypes[number])} className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20">
                {sessionTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className={`rounded-[2rem] bg-gradient-to-br ${selectedModule.colour} text-white p-6 mb-6`}>
            <p className="uppercase tracking-[0.25em] text-xs font-bold text-white/70 mb-2">Current module</p>
            <h3 className="font-display text-3xl mb-3">{selectedModule.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedModule.nextActions.slice(0, 4).map((action) => <p key={action} className="text-sm text-white/80 flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0" />{action}</p>)}
            </div>
          </div>

          <label className="block mb-5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">Reflection / mistake captured</span>
            <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} rows={5} placeholder="What did I complete? What mistake must I retest? What is the next tiny step?" className="w-full rounded-3xl bg-slate-50 border border-slate-100 px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20" />
          </label>

          <button onClick={() => saveSession(false)} className="w-full maroon-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
            <CheckCircle2 size={20} /> {saved ? 'Session saved' : 'Save session log'}
          </button>

          <div className="mt-6 rounded-[2rem] bg-slate-950 text-white p-6">
            <h3 className="font-display text-2xl mb-3 flex items-center gap-2"><Coffee className="text-stellenbosch-gold" /> After-session rule</h3>
            <p className="text-sm text-white/70">Never end with only “done”. End with a correction, a retest date, or tomorrow’s first 15-minute step. That is what turns effort into exam improvement.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

const FloatingIcon: React.FC<{ icon: React.ReactNode, top?: string, left?: string, right?: string, bottom?: string, delay: number }> = (props) => (
  <motion.div 
    animate={{ y: [0, -15, 0] }}
    transition={{ duration: 6, repeat: Infinity, delay: props.delay, ease: 'easeInOut' }}
    style={{ position: 'absolute', top: props.top, left: props.left, right: props.right, bottom: props.bottom }}
    className="w-12 h-12 rounded-2xl glass flex items-center justify-center shadow-sm text-slate-300"
  >
    {props.icon}
  </motion.div>
);

export default Timer;
