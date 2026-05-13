import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Calculator, LineChart, Save, Target, TrendingUp } from 'lucide-react';
import { modules } from '../data/baccllb';
import { readinessLabel, requiredMarkForTarget, riskTone } from '../lib/studyMetrics';

interface MarkRow {
  moduleId: string;
  currentMark: number;
  completedWeight: number;
  nextWeight: number;
  targetMark: number;
}

const defaultRows: MarkRow[] = modules.map((module) => ({
  moduleId: module.id,
  currentMark: module.currentMark ?? 0,
  completedWeight: module.currentMark ? 35 : 0,
  nextWeight: 20,
  targetMark: module.target,
}));

const Marks: React.FC = () => {
  const [rows, setRows] = useState<MarkRow[]>(() => {
    const saved = localStorage.getItem('baccllb-mark-rows');
    return saved ? JSON.parse(saved) : defaultRows;
  });
  const [savedPulse, setSavedPulse] = useState(false);

  useEffect(() => {
    localStorage.setItem('baccllb-mark-rows', JSON.stringify(rows));
  }, [rows]);

  const scenarios = useMemo(() => rows.map((row) => {
    const module = modules.find((item) => item.id === row.moduleId) || modules[0];
    const required = requiredMarkForTarget(row);
    const weightedSoFar = (row.currentMark * row.completedWeight) / 100;
    const remainingWeight = Math.max(0, 100 - row.completedWeight);
    const projectedIfTarget = weightedSoFar + (row.targetMark * remainingWeight) / 100;
    return { ...row, module, required, projectedIfTarget };
  }), [rows]);

  const averageCurrent = Math.round(rows.reduce((sum, row) => sum + row.currentMark, 0) / rows.length);
  const atRisk = scenarios.filter((scenario) => scenario.required > 80 || scenario.currentMark < 50).length;

  const updateRow = (moduleId: string, key: keyof MarkRow, value: number) => {
    setRows((current) => current.map((row) => row.moduleId === moduleId ? { ...row, [key]: value } : row));
  };

  const saveNow = () => {
    localStorage.setItem('baccllb-mark-rows', JSON.stringify(rows));
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1200);
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">marks forecasting</p>
          <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Semester Mark Control Room</h1>
          <p className="text-slate-500 max-w-3xl">Input your current mark, completed weight, next assessment weight and target. The app calculates the mark you should aim for next to stay on track.</p>
        </div>
        <button onClick={saveNow} className="maroon-gradient text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-stellenbosch-maroon/20 hover:scale-105 transition-transform">
          <Save size={18} /> {savedPulse ? 'Saved' : 'Save scenarios'}
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Kpi icon={<LineChart />} label="Average current input" value={`${averageCurrent}%`} note={readinessLabel(averageCurrent)} tone={riskTone(averageCurrent)} />
        <Kpi icon={<AlertTriangle />} label="Risk count" value={atRisk} note="Needs intervention" tone={atRisk ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} />
        <Kpi icon={<Target />} label="Goal" value="70–80%+" note="A2 distinction push" />
      </section>

      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="hidden lg:grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-3 px-6 py-4 bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          <span>Module</span><span>Current %</span><span>Completed weight</span><span>Next weight</span><span>Target</span><span>Required next</span>
        </div>
        <div className="divide-y divide-slate-100">
          {scenarios.map((scenario) => {
            const Icon = scenario.module.icon;
            const requiredTone = scenario.required > 90 ? 'text-red-700 bg-red-50 border-red-100' : scenario.required > 75 ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100';
            return (
              <motion.div layout key={scenario.moduleId} className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-4 lg:gap-3 p-5 lg:items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${scenario.module.colour} text-white flex items-center justify-center shrink-0`}><Icon size={22} /></div>
                  <div>
                    <p className="font-bold text-slate-800">{scenario.module.shortName}</p>
                    <p className="text-xs text-slate-400">{scenario.module.code}</p>
                  </div>
                </div>
                <NumberInput label="Current %" value={scenario.currentMark} onChange={(value) => updateRow(scenario.moduleId, 'currentMark', value)} />
                <NumberInput label="Completed weight" value={scenario.completedWeight} onChange={(value) => updateRow(scenario.moduleId, 'completedWeight', value)} />
                <NumberInput label="Next weight" value={scenario.nextWeight} onChange={(value) => updateRow(scenario.moduleId, 'nextWeight', value)} />
                <NumberInput label="Target" value={scenario.targetMark} onChange={(value) => updateRow(scenario.moduleId, 'targetMark', value)} />
                <div className={`rounded-2xl border p-4 ${requiredTone}`}>
                  <p className="text-xs uppercase font-bold tracking-wider opacity-70 mb-1">Required next</p>
                  <p className="font-display text-3xl">{Math.round(scenario.required)}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-[2.5rem] p-7 border-slate-200/50">
          <h2 className="font-display text-3xl text-stellenbosch-maroon mb-4 flex items-center gap-2"><Calculator /> How to use this</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p><strong>Current %</strong> = your mark so far for the module, not the mark you want.</p>
            <p><strong>Completed weight</strong> = how much of the final module mark has already been assessed.</p>
            <p><strong>Next weight</strong> = the weighting of your next test/assignment. This is the “what must I aim for next?” calculation.</p>
            <p><strong>Required next</strong> is conservative because it assumes future remaining marks hit your target. If it shows over 90%, the module needs an immediate rescue plan.</p>
          </div>
        </div>
        <div className="bg-slate-950 text-white rounded-[2.5rem] p-7 shadow-2xl shadow-slate-950/20">
          <h2 className="font-display text-3xl mb-4 flex items-center gap-2"><TrendingUp className="text-stellenbosch-gold" /> Rescue triggers</h2>
          <div className="space-y-3 text-sm text-white/70">
            <p>• Required next mark above 85% → switch from notes to exam practice.</p>
            <p>• Current mark below 55% → create a weekly mistake loop and ask LexAI for a diagnostic plan.</p>
            <p>• Confidence below 50% but current mark okay → pressure simulation is the missing layer.</p>
            <p>• Calculations okay but exam marks weak → write the “why” next to every working.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const NumberInput: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
  <label className="block">
    <span className="lg:hidden text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">{label}</span>
    <input
      type="number"
      min="0"
      max="150"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
    />
  </label>
);

const Kpi: React.FC<{ icon: React.ReactNode; label: string; value: string | number; note: string; tone?: string }> = ({ icon, label, value, note, tone }) => (
  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
    <div className="w-12 h-12 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center mb-5">{icon}</div>
    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{label}</p>
    <p className="font-display text-4xl text-slate-900 my-1">{value}</p>
    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tone || 'bg-slate-50 text-slate-500 border-slate-100'}`}>{note}</span>
  </div>
);

export default Marks;
