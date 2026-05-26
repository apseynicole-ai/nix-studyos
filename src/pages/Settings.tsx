import React, { useMemo, useRef, useState } from 'react';
import { Download, LogIn, LogOut, NotebookTabs, Scale, ShieldAlert, Upload, Trash2, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportBackup, getLastBackupMeta, importBackup, resetAppData } from '../lib/localData';
import { signInWithEmail, signOutUser, signUpWithEmailAndUsername } from '../lib/firebase';
import { useAuth } from '../components/auth/AuthGuard';
import {
  academicSnapshotExampleJson,
  deleteAcademicSnapshot,
  getLatestAcademicSnapshot,
  importAcademicSnapshot,
  readAcademicSnapshots,
  saveImportedAcademicSnapshot,
  summarizeAcademicSnapshot,
  type AcademicSnapshot,
} from '../lib/academicSnapshots';

type AuthMode = 'signin' | 'signup';

const Settings: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { user, profile, localFirstMode } = useAuth();
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [lastBackupMeta, setLastBackupMeta] = useState(() => getLastBackupMeta());
  const [snapshotInput, setSnapshotInput] = useState(() => academicSnapshotExampleJson());
  const [snapshots, setSnapshots] = useState<AcademicSnapshot[]>(() => readAcademicSnapshots());
  const latestSnapshot = useMemo(() => snapshots[0] ?? null, [snapshots]);
  const latestSnapshotSummary = useMemo(() => summarizeAcademicSnapshot(latestSnapshot), [latestSnapshot]);

  const handleExport = () => {
    const { fileName, includedKeys } = exportBackup();
    setLastBackupMeta(getLastBackupMeta());
    setStatus({
      type: 'ok',
      msg: `Backup downloaded as ${fileName}. Included ${includedKeys.length} local StudyOS key${includedKeys.length === 1 ? '' : 's'}.`,
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const confirmed = window.confirm(
      'Import backup?\n\nThis may overwrite your current local StudyOS data for any matching keys in the backup. Continue?'
    );
    if (!confirmed) return;
    try {
      const { keys, warning } = await importBackup(file);
      setLastBackupMeta(getLastBackupMeta());
      setStatus({
        type: 'ok',
        msg: `${warning ? `${warning} ` : ''}Imported ${keys.length} key${keys.length === 1 ? '' : 's'}. Refresh the page if any views still show old data.`,
      });
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

  const handleImportSnapshot = () => {
    setStatus(null);

    try {
      const parsed = JSON.parse(snapshotInput);
      const snapshot = importAcademicSnapshot(parsed);
      const next = saveImportedAcademicSnapshot(snapshot);
      setSnapshots(next);
      setStatus({
        type: 'ok',
        msg: `Academic snapshot imported. Saved ${snapshot.modules.length} module update${snapshot.modules.length === 1 ? '' : 's'} locally without changing marks-engine data.`,
      });
    } catch (error) {
      setStatus({
        type: 'err',
        msg: error instanceof Error ? error.message : 'Could not import academic snapshot.',
      });
    }
  };

  const handleDeleteSnapshot = (id: string) => {
    const confirmed = window.confirm('Delete this saved academic snapshot from local storage?');
    if (!confirmed) return;
    const next = deleteAcademicSnapshot(id);
    setSnapshots(next);
    setStatus({ type: 'ok', msg: 'Academic snapshot deleted from this device.' });
  };

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (authMode === 'signup' && password !== confirmPassword) {
      setStatus({ type: 'err', msg: 'Passwords do not match.' });
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        await signInWithEmail({ email, password });
        setStatus({ type: 'ok', msg: 'Signed in. Local-first mode stays available, and cloud sync can be added later.' });
      } else {
        await signUpWithEmailAndUsername({ username, email, password });
        setStatus({ type: 'ok', msg: 'Account created. You can keep using Nix StudyOS in local-first mode.' });
      }
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus({ type: 'err', msg: getAuthMessage(error) });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setStatus(null);
    try {
      await signOutUser();
      setStatus({ type: 'ok', msg: 'Signed out. Your local-first study data remains on this device.' });
    } catch (error) {
      setStatus({ type: 'err', msg: getAuthMessage(error) });
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-8 pb-36 px-5 md:px-8">
      <header className="mb-8">
        <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">settings</p>
        <h1 className="font-display text-5xl text-stellenbosch-maroon mb-3">Local Data & Account</h1>
        <p className="text-slate-500">Nix StudyOS currently runs as a local-first app. Export backups regularly before clearing browser data or switching devices.</p>
      </header>

      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center">
            <UserRound size={22} />
          </div>
          <div>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Current mode</h2>
            <p className="text-sm text-slate-500">Guest-first and local-first for the current no-billing phase.</p>
          </div>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <p><strong>Mode:</strong> {localFirstMode ? 'Local-first' : 'Signed in with optional cloud profile'}</p>
          <p><strong>Cloud sync:</strong> Postponed until Firebase Firestore is enabled later.</p>
          <p><strong>Sign-in:</strong> Optional. You can keep using the app without logging in.</p>
          <p><strong>Stored on this device:</strong> marks, tasks, timer sessions, AI summaries, and local profile fallback.</p>
          <p><strong>Current profile:</strong> {profile?.displayName || 'Guest'}{profile?.email ? ` (${profile.email})` : ''}</p>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-stellenbosch-gold/10 text-stellenbosch-maroon flex items-center justify-center">
            <Download size={20} />
          </div>
          <div>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">PWA readiness</h2>
            <p className="text-sm text-slate-500">Install-friendly and prepared for basic offline app shell access.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-stellenbosch-gold/30 bg-stellenbosch-gold/10 px-4 py-4 text-sm text-slate-700">
          <p className="font-semibold text-stellenbosch-maroon">PWA ready: install Nix StudyOS to your Home Screen for faster offline access.</p>
          <p className="mt-2">The app shell and core static assets can load offline after installation. Live cloud features and server-backed responses still need a connection.</p>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Optional account</h2>
            <p className="text-sm text-slate-500">Firebase Auth can be used later without changing the local-first flow.</p>
          </div>
          {user ? (
            <button onClick={handleSignOut} className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
              <LogOut size={16} /> Sign out
            </button>
          ) : null}
        </div>

        {user ? (
          <p className="text-sm text-slate-600">Signed in as {user.email || profile?.displayName || 'your account'}. Local-first storage remains available either way.</p>
        ) : (
          <>
            <div className="flex gap-2 rounded-2xl bg-slate-50 p-1 mb-5">
              <ModeButton active={authMode === 'signin'} onClick={() => setAuthMode('signin')}>Sign in</ModeButton>
              <ModeButton active={authMode === 'signup'} onClick={() => setAuthMode('signup')}>Create account</ModeButton>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <Field
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  placeholder="Optional for future cloud identity"
                  autoComplete="username"
                />
              )}
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
              />
              <Field
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder={authMode === 'signin' ? 'Enter your password' : 'Choose a password'}
                type="password"
                autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
              />
              {authMode === 'signup' && (
                <Field
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Re-enter your password"
                  type="password"
                  autoComplete="new-password"
                />
              )}
              <button type="submit" disabled={authLoading} className="w-full maroon-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform disabled:opacity-60">
                <LogIn size={18} />
                {authLoading ? (authMode === 'signin' ? 'Signing in...' : 'Creating account...') : (authMode === 'signin' ? 'Sign in optionally' : 'Create optional account')}
              </button>
            </form>
          </>
        )}
      </section>

      <section id="academic-snapshot" className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-stellenbosch-maroon/5 text-stellenbosch-maroon flex items-center justify-center">
            <NotebookTabs size={22} />
          </div>
          <div>
            <h2 className="font-display text-3xl text-stellenbosch-maroon">Academic Snapshot Import</h2>
            <p className="text-sm text-slate-500">Paste a structured academic status snapshot to save a local-first overlay of your current position without overwriting marks-engine data.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-stellenbosch-maroon/10 bg-stellenbosch-maroon/5 px-4 py-4 text-sm text-slate-700">
          <p className="font-semibold text-stellenbosch-maroon">Paste-based JSON only for now.</p>
          <p className="mt-2">This version stores academic status snapshots separately from marks calculations. It is meant to reflect your current academic position quickly, not to replace the existing marks engine.</p>
        </div>

        {latestSnapshot && latestSnapshotSummary && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <SnapshotMetric label="Latest source" value={latestSnapshot.sourceLabel} detail={new Date(latestSnapshot.createdAt).toLocaleString()} />
            <SnapshotMetric label="Modules updated" value={`${latestSnapshotSummary.modulesUpdated}`} detail="Local overlay only" />
            <SnapshotMetric label="Urgent actions" value={`${latestSnapshotSummary.urgentActionCount}`} detail="Urgent-priority items only" />
            <SnapshotMetric label="Most urgent" value={latestSnapshotSummary.mostUrgentModule || 'None'} detail={latestSnapshotSummary.mostUrgentAction || 'No urgent action captured'} />
          </div>
        )}

        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Expected JSON shape</p>
            <button
              type="button"
              onClick={() => setSnapshotInput(academicSnapshotExampleJson())}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:border-stellenbosch-maroon/30 hover:text-stellenbosch-maroon"
            >
              Load example JSON
            </button>
          </div>
          <textarea
            value={snapshotInput}
            onChange={(event) => setSnapshotInput(event.target.value)}
            className="min-h-[22rem] w-full rounded-[1.75rem] border border-slate-100 bg-slate-50 px-4 py-4 font-mono text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
            spellCheck={false}
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleImportSnapshot}
              className="maroon-gradient rounded-2xl px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.01]"
            >
              Import academic snapshot
            </button>
            <button
              type="button"
              onClick={() => setSnapshotInput('')}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-stellenbosch-maroon/20 hover:text-stellenbosch-maroon"
            >
              Clear JSON
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display text-2xl text-stellenbosch-maroon">Saved snapshots</h3>
              <p className="text-sm text-slate-500">Newest first. Delete any saved overlay you no longer want on this device.</p>
            </div>
            <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {snapshots.length} saved
            </span>
          </div>

          {snapshots.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-sm text-slate-500">
              No academic snapshots saved yet. Paste the JSON example above to import your first current-position overlay.
            </div>
          ) : (
            <div className="space-y-4">
              {snapshots.map((snapshot) => {
                const summary = summarizeAcademicSnapshot(snapshot);
                return (
                  <details key={snapshot.id} className="rounded-[1.75rem] border border-slate-100 bg-slate-50/70 p-5">
                    <summary className="flex cursor-pointer list-none flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{snapshot.sourceLabel}</p>
                        <p className="mt-1 text-sm text-slate-500">{new Date(snapshot.createdAt).toLocaleString()}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {snapshot.modules.length} modules
                          </span>
                          <span className="rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700">
                            {summary?.urgentActionCount ?? 0} urgent actions
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          handleDeleteSnapshot(snapshot.id);
                        }}
                        className="inline-flex items-center gap-2 self-start rounded-2xl border border-red-100 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </summary>

                    <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                      <div className="space-y-4">
                        <SnapshotInfoPanel title="Global actions">
                          {snapshot.globalActions.length === 0 ? (
                            <p className="text-sm text-slate-500">No global actions saved.</p>
                          ) : (
                            snapshot.globalActions.map((action) => (
                              <div key={`${snapshot.id}-${action.title}`} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-slate-800">{action.title}</p>
                                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${snapshotPriorityTone(action.priority)}`}>
                                    {action.priority}
                                  </span>
                                  {action.moduleCode && (
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                      {action.moduleCode}
                                    </span>
                                  )}
                                </div>
                                {action.detail && <p className="mt-2 text-sm text-slate-500">{action.detail}</p>}
                              </div>
                            ))
                          )}
                        </SnapshotInfoPanel>

                        <SnapshotInfoPanel title="Snapshot notes">
                          {snapshot.notes.length === 0 ? (
                            <p className="text-sm text-slate-500">No snapshot-level notes saved.</p>
                          ) : (
                            <ul className="space-y-2 text-sm text-slate-600">
                              {snapshot.notes.map((note) => <li key={note}>• {note}</li>)}
                            </ul>
                          )}
                        </SnapshotInfoPanel>
                      </div>

                      <SnapshotInfoPanel title="Module details">
                        <div className="space-y-3">
                          {snapshot.modules.map((module) => (
                            <div key={`${snapshot.id}-${module.moduleCode}`} className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-800">{module.moduleName}</p>
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{module.moduleCode}</span>
                                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${snapshotStatusTone(module.status)}`}>{module.status}</span>
                              </div>
                              {module.currentKnownMarks.length > 0 && (
                                <p className="mt-2 text-sm text-slate-500">
                                  Known marks: {module.currentKnownMarks.slice(0, 3).map((mark) => `${mark.name}${typeof mark.percentage === 'number' ? ` ${mark.percentage}%` : ''}`).join(' • ')}
                                </p>
                              )}
                              {module.missingAssessments.length > 0 && (
                                <p className="mt-2 text-sm text-slate-500">
                                  Missing / pending: {module.missingAssessments.slice(0, 3).map((assessment) => `${assessment.name} (${assessment.status})`).join(' • ')}
                                </p>
                              )}
                              {module.urgentActions.length > 0 && (
                                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                                  {module.urgentActions.slice(0, 3).map((action) => <li key={action}>• {action}</li>)}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </SnapshotInfoPanel>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="space-y-4">
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-3xl text-stellenbosch-maroon">Backup Centre</h2>
              <p className="text-sm text-slate-500">Export a single local-first backup before clearing browser data, switching devices, or making risky changes.</p>
            </div>
            {lastBackupMeta && (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Last {lastBackupMeta.action}</p>
                <p className="text-sm font-semibold text-slate-700">
                  {new Date(lastBackupMeta.action === 'import' && lastBackupMeta.importedAt ? lastBackupMeta.importedAt : lastBackupMeta.exportedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600">
            Backups include the important StudyOS local keys currently used by marks, tasks, planner, timer, dashboard, topic mastery, mistake bank, profile, summaries, and module targets. Importing restores only the included StudyOS keys and does not touch unrelated browser storage.
          </p>
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-900 flex gap-3">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Import warning</p>
              <p className="mt-1">Importing a backup may overwrite your current local StudyOS data for matching keys. Invalid or malformed files are rejected before anything is restored.</p>
            </div>
          </div>
          {lastBackupMeta && (
            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Included keys in last backup action</p>
              <p className="text-sm text-slate-600 break-words">
                {lastBackupMeta.includedKeys.length > 0 ? lastBackupMeta.includedKeys.join(', ') : 'No key list recorded.'}
              </p>
              {lastBackupMeta.warning && (
                <p className="mt-3 text-sm text-amber-800">{lastBackupMeta.warning}</p>
              )}
            </div>
          )}
        </section>

        <ActionCard
          icon={<Download size={20} />}
          title="Export backup"
          description="Downloads one Nix StudyOS JSON file with app metadata, included key names, and your current local-first StudyOS data."
          buttonLabel="Export JSON"
          buttonClass="maroon-gradient text-white"
          onClick={handleExport}
        />

        <ActionCard
          icon={<Upload size={20} />}
          title="Import backup"
          description="Validates the selected Nix StudyOS backup file first, then asks for confirmation before overwriting any matching local StudyOS data."
          buttonLabel="Import JSON"
          buttonClass="bg-slate-800 text-white"
          onClick={() => fileRef.current?.click()}
        />
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />

        <ActionCard
          icon={<Trash2 size={20} />}
          title="Reset local data"
          description="Permanently removes all saved marks, tasks, timer sessions, AI summaries, and other local app data. Export a backup first."
          buttonLabel="Reset data"
          buttonClass="bg-red-600 text-white"
          onClick={handleReset}
        />

        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-stellenbosch-maroon"><Scale size={20} /></span>
              <p className="font-bold text-slate-800">Legal Citation Checker</p>
            </div>
            <p className="text-sm text-slate-500">
              Run a local-only citation review for footnotes, bibliography gaps, placeholders, and manual Writing Guide checks.
            </p>
          </div>
          <Link
            to="/legal-verifier"
            className="shrink-0 px-5 py-2.5 rounded-2xl font-bold text-sm bg-stellenbosch-maroon text-white hover:scale-105 transition-transform text-center"
          >
            Open checker
          </Link>
        </section>
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

const SnapshotMetric: React.FC<{ detail: string; label: string; value: string }> = ({ detail, label, value }) => (
  <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 px-4 py-4">
    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</p>
    <p className="mt-2 font-display text-2xl text-stellenbosch-maroon break-words">{value}</p>
    <p className="mt-1 text-sm text-slate-500">{detail}</p>
  </div>
);

const SnapshotInfoPanel: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
  <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4">
    <p className="mb-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">{title}</p>
    {children}
  </div>
);

const Field: React.FC<{
  autoComplete?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}> = ({ autoComplete, label, onChange, placeholder, type = 'text', value }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">{label}</span>
    <input
      autoComplete={autoComplete}
      className="w-full bg-white rounded-2xl border border-slate-100 px-4 py-4 text-base font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-stellenbosch-maroon/20"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  </label>
);

const ModeButton: React.FC<{ active: boolean; children: React.ReactNode; onClick: () => void }> = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${active ? 'bg-stellenbosch-maroon text-white shadow-sm' : 'text-slate-500 hover:text-stellenbosch-maroon'}`}
  >
    {children}
  </button>
);

function getAuthMessage(error: unknown) {
  const maybeCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';

  switch (maybeCode) {
    case 'auth/email-already-in-use':
      return 'That email address is already in use.';
    case 'auth/invalid-email':
    case 'invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Weak password. Choose a stronger password.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase yet.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Wrong password or account details.';
    case 'auth/user-not-found':
      return 'Account not found.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return error instanceof Error ? error.message : 'Authentication failed.';
  }
}

function snapshotPriorityTone(priority: 'low' | 'medium' | 'high' | 'urgent') {
  switch (priority) {
    case 'urgent':
      return 'bg-red-50 text-red-700 border border-red-100';
    case 'high':
      return 'bg-amber-50 text-amber-800 border border-amber-100';
    case 'medium':
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}

function snapshotStatusTone(status: 'stable' | 'watch' | 'urgent') {
  switch (status) {
    case 'urgent':
      return 'bg-red-50 text-red-700 border border-red-100';
    case 'watch':
      return 'bg-amber-50 text-amber-800 border border-amber-100';
    default:
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  }
}

export default Settings;
