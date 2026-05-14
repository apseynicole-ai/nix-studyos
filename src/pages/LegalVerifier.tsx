import React, { useMemo, useState } from 'react';
import { Download, FileSearch, Scale, ShieldAlert } from 'lucide-react';
import {
  analyzeLegalCitationDraft,
  formatLegalVerifierReport,
  type LegalVerifierIssue,
  type LegalVerifierReport,
} from '../lib/legalVerifier';

const LegalVerifier: React.FC = () => {
  const [draftText, setDraftText] = useState('');
  const [footnotesText, setFootnotesText] = useState('');
  const [bibliographyText, setBibliographyText] = useState('');
  const [guideRulesText, setGuideRulesText] = useState('');

  const report = useMemo<LegalVerifierReport>(
    () =>
      analyzeLegalCitationDraft({
        draftText,
        footnotesText,
        bibliographyText,
        guideRulesText,
      }),
    [bibliographyText, draftText, footnotesText, guideRulesText],
  );

  const exportReport = (type: 'md' | 'txt') => {
    const body = formatLegalVerifierReport(report);
    const blob = new Blob([body], { type: type === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `legal-citation-check-report.${type}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">local citation review</p>
          <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Legal Citation Checker</h1>
          <p className="text-slate-500 max-w-3xl">
            Deterministic local-first checks for footnotes, bibliography gaps, placeholders, and likely consistency issues.
            This MVP does not call LexAI, Gemini, or any external verifier.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportReport('md')}
            className="rounded-2xl maroon-gradient text-white px-5 py-3 font-bold flex items-center gap-2 hover:scale-[1.01] transition-transform"
          >
            <Download size={18} />
            Export Markdown
          </button>
          <button
            onClick={() => exportReport('txt')}
            className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-bold flex items-center gap-2 hover:scale-[1.01] transition-transform"
          >
            <Download size={18} />
            Export Text
          </button>
        </div>
      </header>

      <section className="mb-8 rounded-[2rem] border border-amber-100 bg-amber-50/80 p-5 text-amber-900">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-bold">Privacy note</p>
            <p className="text-sm mt-1">
              Your pasted legal text is used for this check only unless you export the report.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="space-y-6">
          <InputCard
            title="Final assignment or draft text"
            description="Paste your main body text here if you want the checker to infer likely citations or footnote fragments."
            value={draftText}
            onChange={setDraftText}
            placeholder="Paste assignment body text here..."
          />
          <InputCard
            title="Footnotes text"
            description="Paste separate footnotes here for stronger citation checks. Leave blank if your draft already contains clear footnote lines."
            value={footnotesText}
            onChange={setFootnotesText}
            placeholder="1. Author Title (2024) 14.\n2. Case Name 2023 (3) SA 100 (CC)."
          />
          <InputCard
            title="Bibliography text"
            description="Paste one source per line where possible so duplicates and likely uncited items can be detected."
            value={bibliographyText}
            onChange={setBibliographyText}
            placeholder="Author, A 2024. Book Title. Cape Town: Publisher."
          />
          <InputCard
            title="Writing Guide rules (optional)"
            description="Paste actual module or faculty guide rules here if you want a manual checklist section in the report. No official compliance is claimed unless you provide the rules."
            value={guideRulesText}
            onChange={setGuideRulesText}
            placeholder="Paste any lecturer or faculty writing guide rules here..."
          />
        </div>

        <div className="space-y-6">
          <StatusCard report={report} />
          <ReportCard title="Footnote issues" issues={report.footnoteIssues} accent="maroon" />
          <ReportCard title="Bibliography issues" issues={report.bibliographyIssues} accent="slate" />
          <ReportCard title="Possible missing bibliography items" issues={report.missingBibliographyItems} accent="amber" />
          <ReportCard title="Possible uncited bibliography items" issues={report.uncitedBibliographyItems} accent="emerald" />
          <ReportCard title="Writing Guide checklist" issues={report.guideChecklist} accent="sky" />
          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <h2 className="font-display text-2xl text-stellenbosch-maroon mb-4">Final fix checklist</h2>
            <div className="space-y-3">
              {report.finalFixChecklist.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

const InputCard: React.FC<{
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ title, description, value, onChange, placeholder }) => (
  <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
    <h2 className="font-display text-2xl text-stellenbosch-maroon mb-2">{title}</h2>
    <p className="text-sm text-slate-500 mb-4">{description}</p>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full min-h-[180px] rounded-[1.5rem] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/30"
    />
  </section>
);

const StatusCard: React.FC<{ report: LegalVerifierReport }> = ({ report }) => (
  <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center">
        <Scale size={22} />
      </div>
      <div>
        <p className="uppercase tracking-[0.25em] text-[10px] font-bold text-slate-400">overall status</p>
        <h2 className="font-display text-2xl text-stellenbosch-maroon">Review summary</h2>
      </div>
    </div>
    <p className="text-slate-600 leading-relaxed">{report.overallStatus}</p>
    <div className="grid grid-cols-2 gap-3 mt-5">
      <MiniMetric label="Footnotes" value={report.footnoteIssues.length} />
      <MiniMetric label="Bibliography" value={report.bibliographyIssues.length} />
      <MiniMetric label="Missing items" value={report.missingBibliographyItems.length} />
      <MiniMetric label="Uncited items" value={report.uncitedBibliographyItems.length} />
    </div>
  </section>
);

const MiniMetric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
    <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">{label}</p>
    <p className="text-2xl font-display text-stellenbosch-maroon">{value}</p>
  </div>
);

const ReportCard: React.FC<{
  title: string;
  issues: LegalVerifierIssue[];
  accent: 'maroon' | 'slate' | 'amber' | 'emerald' | 'sky';
}> = ({ title, issues, accent }) => {
  const accentClass =
    accent === 'maroon'
      ? 'text-stellenbosch-maroon bg-stellenbosch-maroon/5'
      : accent === 'amber'
        ? 'text-amber-700 bg-amber-50'
        : accent === 'emerald'
          ? 'text-emerald-700 bg-emerald-50'
          : accent === 'sky'
            ? 'text-sky-700 bg-sky-50'
            : 'text-slate-700 bg-slate-50';

  return (
    <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accentClass}`}>
          <FileSearch size={20} />
        </div>
        <h2 className="font-display text-2xl text-stellenbosch-maroon">{title}</h2>
      </div>
      {issues.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          No obvious items flagged by the deterministic checker here.
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  {issue.severity}
                </span>
                {issue.lineLabel && (
                  <span className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    {issue.lineLabel}
                  </span>
                )}
              </div>
              <p className="font-bold text-slate-800">{issue.title}</p>
              <p className="text-sm text-slate-600 mt-1">{issue.detail}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default LegalVerifier;
