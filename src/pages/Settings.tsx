import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { exportBackup, importBackup, resetAppData } from '../lib/localData';

const Settings: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const handleExport = () => {
    exportBackup();
    setStatus({ type: 'ok', msg: 'Backup downloaded.' });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const confirmed = window.confirm(
      'Import backup?\n\nThis will overwrite any matching local data with the values in the file. Continue?'
    );
    if (!confirmed) return;
    try {
      const { keys } = await importBackup(file);
      setStatus({ type: 'ok', msg: `Imported ${keys.length} key${keys.length === 1 ? '' : 's'}: ${keys.join(', ')}` });
    } catch (err) {
      setStatus({ type: 'err', msg: err instanceof Error ? err.message : 'Import failed.' });
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Reset all local app data?\n\nThis permanently removes your saved marks, tasks, timer sessions, and all other local data. This cannot be undone. Continue?'
    );
    if (!confirmed) return;
    resetAppData();
    setStatus({ type: 'ok', msg: 'Local app data cleared. Reload the page to see defaults.' });
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8">
        <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">settings</p>
        <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Data & Backup</h1>
        <p className="text-slate-500">Export your local data before a device switch or Firestore migration, or import a previous backup.</p>
      </header>

      <div className="space-y-4">
        <ActionCard
          icon={<Download size={20} />}
          title="Export backup"
          description="Downloads all local app data as a JSON file."
          buttonLabel="Export JSON"
          buttonClass="maroon-gradient text-white"
          onClick={handleExport}
        />

        <ActionCard
          icon={<Upload size={20} />}
          title="Import backup"
          description="Restores data from a previously exported JSON file. You will be asked to confirm before any data is overwritten."
          buttonLabel="Import JSON"
          buttonClass="bg-slate-800 text-white"
          onClick={() => fileRef.current?.click()}
        />
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />

        <ActionCard
          icon={<Trash2 size={20} />}
          title="Reset local data"
          description="Permanently removes all saved marks, tasks, timer sessions, and other local app data. Export a backup first."
          buttonLabel="Reset data"
          buttonClass="bg-red-600 text-white"
          onClick={handleReset}
        />
      </div>

      {status && (
        <div className={`mt-6 rounded-2xl px-5 py-4 text-sm font-medium border ${status.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
};

const ActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonClass: string;
  onClick: () => void;
}> = ({ icon, title, description, buttonLabel, buttonClass, onClick }) => (
  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-stellenbosch-maroon">{icon}</span>
        <p className="font-bold text-slate-800">{title}</p>
      </div>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    <button onClick={onClick} className={`shrink-0 px-5 py-2.5 rounded-2xl font-bold text-sm hover:scale-105 transition-transform ${buttonClass}`}>
      {buttonLabel}
    </button>
  </div>
);

export default Settings;
