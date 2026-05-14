import React, { useRef, useState } from 'react';
import { Download, LogIn, LogOut, Upload, Trash2, UserRound } from 'lucide-react';
import { exportBackup, importBackup, resetAppData } from '../lib/localData';
import { signInWithEmail, signOutUser, signUpWithEmailAndUsername } from '../lib/firebase';
import { useAuth } from '../components/auth/AuthGuard';

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

      <div className="space-y-4">
        <ActionCard
          icon={<Download size={20} />}
          title="Export backup"
          description="Downloads all local app data as a JSON file. Use this regularly because your study data is currently device-local."
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
          description="Permanently removes all saved marks, tasks, timer sessions, AI summaries, and other local app data. Export a backup first."
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

export default Settings;
