import React, { useMemo, useState } from 'react';
import { CheckCircle2, Copy, Download, FileSearch, Scale, ShieldAlert, Sparkles } from 'lucide-react';
import {
  analyzeLegalCitationDraft,
  formatLegalVerifierReport,
  generateAiReviewPrompt,
  type LegalVerifierIssue,
  type LegalVerifierReport,
} from '../lib/legalVerifier';

const LegalVerifier: React.FC = () => {
  const [draftText, setDraftText] = useState('');
  const [footnotesText, setFootnotesText] = useState('');
  const [bibliographyText, setBibliographyText] = useState('');
  const [sourcePackText, setSourcePackText] = useState('');
  const [guideRulesText, setGuideRulesText] = useState('');
  const [rubricText, setRubricText] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  const report = useMemo<LegalVerifierReport>(
    () =>
      analyzeLegalCitationDraft({
        draftText,
        footnotesText,
        bibliographyText,
        sourcePackText,
        guideRulesText,
        rubricText,
      }),
    [bibliographyText, draftText, footnotesText, guideRulesText, rubricText, sourcePackText],
  );

  const exportReport = (type: 'md' | 'txt') => {
    const body = formatLegalVerifierReport(report, generatedPrompt || undefined);
    const blob = new Blob([body], { type: type === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `legal-source-review.${type}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleGeneratePrompt = () => {
    setGeneratedPrompt(
      generateAiReviewPrompt(
        {
          draftText,
          footnotesText,
          bibliographyText,
          sourcePackText,
          guideRulesText,
          rubricText,
        },
        report,
      ),
    );
    setCopyStatus('idle');
  };

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopyStatus('ok');
    } catch {
      setCopyStatus('err');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">local legal review workflow</p>
          <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Legal Source &amp; Citation Review</h1>
          <p className="text-slate-500 max-w-3xl">
            Use this page in two layers: first run local deterministic citation checks, then generate a strict AI-ready
            source-based review prompt for Claude, ChatGPT, Gemini, or a future in-app verifier.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge text="Local citation checks" />
            <Badge text="AI-ready source review prompt" />
            <Badge text="No AI calls in this version" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGeneratePrompt}
            className="rounded-2xl maroon-gradient text-white px-5 py-3 font-bold flex items-center gap-2 hover:scale-[1.01] transition-transform"
          >
            <Sparkles size={18} />
            Generate AI review prompt
          </button>
          <button
            onClick={() => exportReport('md')}
            className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-bold flex items-center gap-2 hover:scale-[1.01] transition-transform"
          >
            <Download size={18} />
            Export Markdown
          </button>
          <button
            onClick={() => exportReport('txt')}
            className="rounded-2xl bg-slate-700 text-white px-5 py-3 font-bold flex items-center gap-2 hover:scale-[1.01] transition-transform"
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
              Your pasted legal text stays in this page unless you export or copy it. This version does not call AI. AI
              review only happens if you paste the generated prompt into an AI tool or use a future AI verification feature.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="space-y-6">
          <InputCard
            title="Final assignment / legal opinion"
            description="Paste the full submission text here. Deterministic checks can still run if footnotes or bibliography are added later."
            value={draftText}
            onChange={setDraftText}
            placeholder="Paste your final legal opinion or assignment text here..."
          />
          <InputCard
            title="Footnotes"
            description="Paste numbered or unnumbered legal footnotes/citation lines here. The checker now looks for legal citation patterns beyond footnote numbers."
            value={footnotesText}
            onChange={setFootnotesText}
            placeholder={'S 29(1)(a) of the Constitution...\nMinister of Basic Education v Basic Education for All...\nAuthor “Article title”...'}
          />
          <InputCard
            title="Bibliography"
            description="Paste one entry per line where possible so duplicates, likely missing items, and likely uncited items can be reviewed cautiously."
            value={bibliographyText}
            onChange={setBibliographyText}
            placeholder="Author, A 2024. Book Title. Cape Town: Publisher."
          />
          <InputCard
            title="Source pack / prescribed materials"
            description="Paste actual source text, extracts, lecture notes, statutes, cases, or prescribed materials here if you want a future AI tool to verify factual or legal support."
            value={sourcePackText}
            onChange={setSourcePackText}
            placeholder="Paste source extracts, prescribed readings, cases, statutes, or lecturer materials here..."
          />
          <InputCard
            title="Faculty / Writing Guide rules"
            description="Paste only the actual guide rules or excerpted guide text you want checked. This tool will not claim official compliance unless you provide the rules."
            value={guideRulesText}
            onChange={setGuideRulesText}
            placeholder="Paste Writing Guide rules, lecturer instructions, or faculty legal writing requirements here..."
          />
          <InputCard
            title="Rubric / marking criteria (optional)"
            description="Paste the rubric only if you want a later AI review prompt to request a cautious mark-band estimate. Without a rubric, no mark estimate should be requested."
            value={rubricText}
            onChange={setRubricText}
            placeholder="Paste the marking rubric or criteria here if available..."
          />
        </div>

        <div className="space-y-6">
          <StatusCard report={report} />
          <PromptCard
            generatedPrompt={generatedPrompt}
            copyStatus={copyStatus}
            onCopy={handleCopyPrompt}
            onGenerate={handleGeneratePrompt}
          />
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

const Badge: React.FC<{ text: string }> = ({ text }) => (
  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-500">
    {text}
  </span>
);

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
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 mt-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">Parsing confidence</p>
      <p className="font-semibold text-slate-700 capitalize">{report.parsingConfidence}</p>
    </div>
    {report.summaryNotes.length > 0 && (
      <div className="space-y-2 mt-4">
        {report.summaryNotes.map((note) => (
          <div key={note} className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900">
            {note}
          </div>
        ))}
      </div>
    )}
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

const PromptCard: React.FC<{
  generatedPrompt: string;
  copyStatus: 'idle' | 'ok' | 'err';
  onCopy: () => void;
  onGenerate: () => void;
}> = ({ generatedPrompt, copyStatus, onCopy, onGenerate }) => (
  <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-stellenbosch-maroon/5 text-stellenbosch-maroon">
        <Sparkles size={20} />
      </div>
      <div>
        <h2 className="font-display text-2xl text-stellenbosch-maroon">AI-ready source review prompt</h2>
        <p className="text-sm text-slate-500">Generate a strict prompt for Claude, ChatGPT, Gemini, or another external AI tool.</p>
      </div>
    </div>
    {generatedPrompt ? (
      <>
        <textarea
          readOnly
          value={generatedPrompt}
          className="w-full min-h-[280px] rounded-[1.5rem] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-700 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={onCopy}
            className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-bold flex items-center gap-2 hover:scale-[1.01] transition-transform"
          >
            <Copy size={18} />
            Copy AI review prompt
          </button>
          {copyStatus === 'ok' && (
            <span className="text-sm text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} />
              Prompt copied.
            </span>
          )}
          {copyStatus === 'err' && (
            <span className="text-sm text-amber-800">
              Clipboard copy failed. Select the prompt manually and copy it from the text box.
            </span>
          )}
        </div>
      </>
    ) : (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        Generate the AI-ready prompt after pasting whatever sources, guide rules, and rubric details you already have. Missing fields are allowed, but source-support review is stronger when the source pack is included.
        <div className="mt-4">
          <button
            onClick={onGenerate}
            className="rounded-2xl maroon-gradient text-white px-5 py-3 font-bold flex items-center gap-2 hover:scale-[1.01] transition-transform"
          >
            <Sparkles size={18} />
            Generate AI review prompt
          </button>
        </div>
      </div>
    )}
  </section>
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
