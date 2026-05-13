import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, Copy, FileText, Filter, ShieldCheck, Sparkles } from 'lucide-react';
import { examTemplates, promptPacks } from '../data/baccllb';

const ExamVault: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Law' | 'Accounting' | 'Quantitative' | 'Universal'>('All');
  const [copied, setCopied] = useState<string | null>(null);
  const templates = useMemo(() => examTemplates.filter((template) => filter === 'All' || template.area === filter), [filter]);

  const copyText = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">exam-mode templates</p>
          <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Final Boss Vault</h1>
          <p className="text-slate-500 max-w-3xl">Reusable answer skeletons, exam workflows and AI prompt packs for law, accounting, statistics, DLA and A2 preparation.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['All', 'Law', 'Accounting', 'Quantitative', 'Universal'] as const).map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2 rounded-2xl text-xs uppercase tracking-wider font-bold border ${filter === item ? 'bg-stellenbosch-maroon text-white border-stellenbosch-maroon' : 'bg-white text-slate-500 border-slate-100'}`}>{item}</button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {templates.map((template) => (
          <motion.div layout key={template.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center"><ShieldCheck size={22} /></div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">{template.area}</p>
                  <h2 className="font-display text-2xl text-stellenbosch-maroon">{template.title}</h2>
                </div>
              </div>
              <button onClick={() => copyText(template.id, `${template.title}\n\n${template.steps.join('\n')}`)} className="rounded-2xl bg-slate-50 text-slate-500 p-3 hover:text-stellenbosch-maroon transition-colors" aria-label="Copy template"><Copy size={18} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-5">{template.purpose}</p>
            <div className="space-y-3">
              {template.steps.map((step) => (
                <div key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                  <ClipboardCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-600">{step}</p>
                </div>
              ))}
            </div>
            {copied === template.id && <p className="text-xs text-emerald-600 font-bold mt-4">Copied to clipboard.</p>}
          </motion.div>
        ))}
      </section>

      <section className="bg-slate-950 text-white rounded-[2.5rem] p-7 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="uppercase tracking-[0.35em] text-xs text-white/40 font-bold mb-3">AI prompt packs</p>
            <h2 className="font-display text-4xl">Codex / Claude / NotebookLM handoff prompts</h2>
          </div>
          <div className="flex items-center gap-2 text-stellenbosch-gold"><Sparkles /><span className="font-bold text-sm">{promptPacks.length} presets</span></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {promptPacks.map((pack) => (
            <div key={pack.id} className="rounded-3xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-stellenbosch-gold mb-2"><Filter size={12} /> {pack.category}</span>
                  <h3 className="font-bold text-white">{pack.title}</h3>
                </div>
                <button onClick={() => copyText(pack.id, pack.prompt)} className="rounded-2xl bg-white/10 text-white/60 p-3 hover:text-white transition-colors" aria-label="Copy prompt"><Copy size={16} /></button>
              </div>
              <p className="text-sm text-white/60 mb-4">{pack.description}</p>
              <details className="group">
                <summary className="cursor-pointer text-xs uppercase font-bold tracking-wider text-white/50 group-open:text-white">Preview prompt</summary>
                <p className="mt-3 text-sm text-white/70 whitespace-pre-wrap bg-black/20 rounded-2xl p-4 border border-white/10">{pack.prompt}</p>
              </details>
              {copied === pack.id && <p className="text-xs text-emerald-300 font-bold mt-3">Copied to clipboard.</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm">
        <h2 className="font-display text-3xl text-stellenbosch-maroon mb-4 flex items-center gap-2"><FileText /> Submission Integrity Mini-Checker</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {['Question answered directly', 'Authorities are accurate', 'Footnotes are spread logically', 'No unsupported factual claims', 'Bibliography matches footnotes', 'Formatting follows module rules', 'Filename and declaration checked', 'Final PDF/Word/Excel opened after export'].map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600 flex gap-3"><ClipboardCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExamVault;
