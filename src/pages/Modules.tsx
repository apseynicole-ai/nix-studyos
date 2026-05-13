import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, BookMarked, CheckCircle2, Clock3, FileText, GraduationCap, ListChecks, Search, Target } from 'lucide-react';
import { modules, ModuleArea } from '../data/baccllb';
import { priorityScore, readinessLabel, riskTone } from '../lib/studyMetrics';

const areas: Array<ModuleArea | 'All'> = ['All', 'Accounting', 'Law', 'Economics', 'Quantitative', 'Digital'];

const Modules: React.FC = () => {
  const [area, setArea] = useState<ModuleArea | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(modules[0].id);

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesArea = area === 'All' || module.area === area;
      const query = search.toLowerCase();
      const matchesSearch = !query || [module.name, module.code, module.shortName, ...module.weakPoints].join(' ').toLowerCase().includes(query);
      return matchesArea && matchesSearch;
    });
  }, [area, search]);

  const selected = modules.find((module) => module.id === selectedId) || filteredModules[0] || modules[0];
  const SelectedIcon = selected.icon;

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">BAccLLB module intelligence</p>
          <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Module Command Centre</h1>
          <p className="text-slate-500 max-w-3xl">Your module shells now reflect the actual Stellenbosch BAccLLB subjects, known weak points, A2 dates, exam focus and next actions.</p>
        </div>
        <div className="relative max-w-md w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modules, weak spots, topics..."
            className="w-full rounded-2xl bg-white border border-slate-100 pl-11 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {areas.map((item) => (
          <button
            key={item}
            onClick={() => setArea(item)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all ${area === item ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon' : 'bg-white text-slate-500 border-slate-100 hover:border-stellenbosch-maroon/30'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-8">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            const active = selected.id === module.id;
            return (
              <motion.button
                layout
                key={module.id}
                onClick={() => setSelectedId(module.id)}
                className={`text-left rounded-[2rem] p-5 border transition-all ${active ? 'bg-white shadow-xl border-stellenbosch-maroon/20' : 'bg-white/70 border-slate-100 hover:bg-white hover:shadow-md'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${module.colour} text-white flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon size={23} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-800">{module.shortName}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 rounded-full px-2 py-1">{module.code}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{module.weakPoints.slice(0, 2).join(' • ')}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex-1">
                        <div className="h-full bg-stellenbosch-maroon rounded-full" style={{ width: `${module.confidence}%` }} />
                      </div>
                      <span className="text-xs font-bold text-stellenbosch-maroon">{module.confidence}%</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </section>

        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden sticky top-6 self-start">
          <div className={`bg-gradient-to-br ${selected.colour} p-7 text-white relative overflow-hidden`}>
            <div className="absolute right-6 top-6 opacity-20"><SelectedIcon size={120} /></div>
            <div className="relative z-10">
              <p className="uppercase tracking-[0.35em] text-xs font-bold text-white/70 mb-3">{selected.area} • {selected.semester}</p>
              <h2 className="font-display text-4xl mb-2">{selected.name}</h2>
              <p className="text-white/80">Target: {selected.target}% • Confidence: {selected.confidence}% • Priority score: {priorityScore(selected.confidence, selected.target)}</p>
              <span className="mt-4 inline-flex bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs uppercase tracking-wider font-bold">{readinessLabel(selected.confidence)}</span>
            </div>
          </div>

          <div className="p-7 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoPanel icon={<AlertTriangle size={19} />} title="Known weak points" tone="red">
              {selected.weakPoints.map((point) => <Bullet key={point} text={point} />)}
            </InfoPanel>
            <InfoPanel icon={<Target size={19} />} title="Exam focus" tone="gold">
              {selected.examFocus.map((point) => <Bullet key={point} text={point} />)}
            </InfoPanel>
            <InfoPanel icon={<BookMarked size={19} />} title="Study system" tone="green">
              {selected.studySystem.map((point) => <Bullet key={point} text={point} />)}
            </InfoPanel>
            <InfoPanel icon={<ListChecks size={19} />} title="Next actions" tone="blue">
              {selected.nextActions.map((point) => <Bullet key={point} text={point} />)}
            </InfoPanel>
          </div>

          <div className="px-7 pb-7">
            <h3 className="font-display text-2xl text-stellenbosch-maroon mb-4 flex items-center gap-2"><Clock3 size={20} /> Assessment timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selected.assessments.map((assessment) => (
                <div key={assessment.title} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-bold text-slate-800">{assessment.title}</p>
                    <span className={`text-[10px] border rounded-full px-2 py-1 uppercase tracking-wider font-bold ${assessment.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : assessment.status === 'upcoming' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{assessment.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">{assessment.date}{assessment.time ? ` • ${assessment.time}` : ''}</p>
                  {assessment.notes && <p className="text-xs text-slate-500 mt-2">{assessment.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="px-7 pb-7 grid grid-cols-1 md:grid-cols-3 gap-3">
            <MiniMetric icon={<GraduationCap size={18} />} label="Target" value={`${selected.target}%`} />
            <MiniMetric icon={<FileText size={18} />} label="Area" value={selected.area} />
            <MiniMetric icon={<CheckCircle2 size={18} />} label="Status" value={readinessLabel(selected.confidence)} tone={riskTone(selected.confidence)} />
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoPanel: React.FC<{ icon: React.ReactNode; title: string; tone: 'red' | 'gold' | 'green' | 'blue'; children: React.ReactNode }> = ({ icon, title, tone, children }) => {
  const tones = {
    red: 'bg-red-50 text-red-700 border-red-100',
    gold: 'bg-amber-50 text-amber-700 border-amber-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-5">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${tones[tone]}`}>{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

const Bullet: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-slate-600">
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stellenbosch-maroon shrink-0" />
    <p>{text}</p>
  </div>
);

const MiniMetric: React.FC<{ icon: React.ReactNode; label: string; value: string; tone?: string }> = ({ icon, label, value, tone }) => (
  <div className={`rounded-2xl border p-4 ${tone || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
    <div className="flex items-center gap-2 mb-2 text-stellenbosch-maroon">{icon}<span className="text-xs uppercase font-bold tracking-wider">{label}</span></div>
    <p className="font-bold text-sm">{value}</p>
  </div>
);

export default Modules;
