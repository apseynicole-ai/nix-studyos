import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, completeUsernameSetup, db, doc, onSnapshot, signInWithGoogle, signInWithIdentifier, signOutUser, signUpWithEmailAndUsername, type UserProfileRecord } from '../../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  profile: UserProfileRecord | null;
}

type AuthMode = 'signin' | 'signup';

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, profile: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((nextUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', nextUser.uid),
        (snapshot) => {
          setProfile((snapshot.data() as UserProfileRecord | undefined) || null);
          setLoading(false);
        },
        (error) => {
          console.error('Profile fetch error:', error);
          setProfile(null);
          setLoading(false);
        },
      );
    });

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading, profile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stellenbosch-cream">
        <div className="w-12 h-12 border-4 border-stellenbosch-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!profile?.username) {
    return <UsernameSetupScreen user={user} />;
  }

  return <>{children}</>;
};

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const resetFeedback = () => {
    setError(null);
    setInfo(null);
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();
    setLoading(true);

    try {
      await signInWithIdentifier({ identifier, password });
    } catch (err) {
      setError(getAuthMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmailAndUsername({ username, email, password });
      setInfo('Account created. You are now signed in.');
    } catch (err) {
      setError(getAuthMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetFeedback();
    setLoading(true);

    try {
      await signInWithGoogle();
      setInfo('Signed in with Google. Choose a username to finish setup.');
    } catch (err) {
      setError(getAuthMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-stellenbosch-cream">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        <section className="relative overflow-hidden rounded-[2.5rem] maroon-gradient text-white p-8 md:p-10 shadow-2xl shadow-stellenbosch-maroon/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />
          <div className="relative z-10">
            <p className="uppercase tracking-[0.35em] text-xs text-white/70 font-bold mb-4">secure sign-in</p>
            <h1 className="font-display text-5xl md:text-6xl mb-4">Nix StudyOS</h1>
            <p className="text-white/80 text-lg max-w-xl">
              Sign in with your app username or email, keep passwords inside Firebase Auth, and keep cloud data private to its owner.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              <InfoPill label="Username identity" value="Unique app-level handle" />
              <InfoPill label="Password security" value="Handled by Firebase Auth" />
              <InfoPill label="Cloud data" value="Protected by owner-only rules" />
              <InfoPill label="Marks engine" value="Still local-first in this phase" />
            </div>
          </div>
        </section>

        <section className="glass rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-200/60">
          <div className="flex gap-2 rounded-2xl bg-white/80 p-1 mb-6">
            <ModeButton active={mode === 'signin'} onClick={() => { setMode('signin'); resetFeedback(); }}>
              Sign in
            </ModeButton>
            <ModeButton active={mode === 'signup'} onClick={() => { setMode('signup'); resetFeedback(); }}>
              Create account
            </ModeButton>
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Field
                label="Username or email"
                value={identifier}
                onChange={setIdentifier}
                placeholder="e.g. nicole or nicole@example.com"
                autoComplete="username"
              />
              <Field
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                type="password"
                autoComplete="current-password"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full maroon-gradient text-white py-4 rounded-2xl font-bold hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Field
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="3-24 chars, lowercase letters, numbers, _ or -"
                autoComplete="username"
              />
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
                placeholder="Choose a password"
                type="password"
                autoComplete="new-password"
              />
              <Field
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter your password"
                type="password"
                autoComplete="new-password"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full maroon-gradient text-white py-4 rounded-2xl font-bold hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          <div className="my-5 flex items-center gap-3 text-slate-400 text-xs uppercase font-bold tracking-[0.25em]">
            <span className="h-px flex-1 bg-slate-200" />
            Optional
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-white border border-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-medium shadow-sm disabled:opacity-60"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>

          <p className="text-xs text-slate-400 mt-4">
            Google sign-in is still available, but accounts without a username will be asked to choose one before entering the app.
          </p>

          {error && <StatusMessage tone="error" message={error} />}
          {info && <StatusMessage tone="ok" message={info} />}
        </section>
      </div>
    </div>
  );
};

const UsernameSetupScreen: React.FC<{ user: FirebaseUser }> = ({ user }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await completeUsernameSetup(username, user);
    } catch (err) {
      setError(getAuthMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-stellenbosch-cream">
      <div className="w-full max-w-xl glass rounded-[2.5rem] p-8 shadow-xl border border-slate-200/60">
        <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-3">finish setup</p>
        <h1 className="font-display text-4xl text-stellenbosch-maroon mb-3">Choose your username</h1>
        <p className="text-slate-500 mb-6">
          This account is signed in as {user.email || 'your account'}, but it still needs a unique Nix StudyOS username before cloud data access is enabled.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="3-24 chars, lowercase letters, numbers, _ or -"
            autoComplete="username"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full maroon-gradient text-white py-4 rounded-2xl font-bold hover:scale-[1.01] transition-transform disabled:opacity-60"
          >
            {loading ? 'Saving username...' : 'Save username'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => signOutUser()}
          className="w-full mt-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
        >
          Sign out
        </button>

        {error && <StatusMessage tone="error" message={error} />}
      </div>
    </div>
  );
};

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

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
    <p className="text-[10px] uppercase tracking-[0.25em] text-white/65 font-bold">{label}</p>
    <p className="text-sm text-white/90 mt-1">{value}</p>
  </div>
);

const StatusMessage: React.FC<{ message: string; tone: 'error' | 'ok' }> = ({ message, tone }) => (
  <div
    className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium border ${
      tone === 'error'
        ? 'bg-red-50 text-red-800 border-red-100'
        : 'bg-emerald-50 text-emerald-800 border-emerald-100'
    }`}
  >
    {message}
  </div>
);

function getAuthMessage(error: unknown) {
  const maybeCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';

  switch (maybeCode) {
    case 'username-taken':
      return 'Username already taken.';
    case 'invalid-username':
      return 'Invalid username. Use 3-24 lowercase letters, numbers, underscores, or hyphens.';
    case 'auth/email-already-in-use':
      return 'That email address is already in use.';
    case 'auth/invalid-email':
    case 'invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Weak password. Choose a stronger password.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Wrong password or account details.';
    case 'auth/user-not-found':
    case 'account-not-found':
      return 'Account not found.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before completion.';
    case 'missing-email':
      return 'This account does not expose an email address, so username setup cannot finish yet.';
    case 'username-already-set':
      return 'This account already has a different username.';
    case 'not-authenticated':
      return 'Please sign in again and retry.';
    default:
      return error instanceof Error ? error.message : 'Authentication failed.';
  }
}
