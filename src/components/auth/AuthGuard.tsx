import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db, doc, getDoc, isFirestoreUnavailableError, signInWithEmail, signOutUser, signUpWithEmailAndUsername, type UserProfileRecord } from '../../lib/firebase';
import { LOCAL_PROFILE_KEY, readLocalJson, writeLocalJson } from '../../lib/localData';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  localFirstMode: boolean;
  profile: UserProfileRecord | null;
}

type AuthMode = 'signin' | 'signup';

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, localFirstMode: false, profile: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [localFirstMode, setLocalFirstMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const unsubscribeAuth = auth.onAuthStateChanged(async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLocalFirstMode(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const snapshot = await Promise.race([
          getDoc(doc(db, 'users', nextUser.uid)),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Profile load timed out.')), 8000);
          }),
        ]);

        if (cancelled) return;

        const cloudProfile = (snapshot.data() as UserProfileRecord | undefined) || null;
        if (cloudProfile) {
          setProfile(cloudProfile);
          writeLocalJson(LOCAL_PROFILE_KEY, cloudProfile);
          setLocalFirstMode(false);
        } else {
          const fallbackProfile = buildLocalProfile(nextUser);
          setProfile(fallbackProfile);
          writeLocalJson(LOCAL_PROFILE_KEY, fallbackProfile);
          setLocalFirstMode(true);
        }
      } catch (error) {
        console.error('Profile bootstrap fallback:', getSafeErrorDetail(error));
        if (cancelled) return;

        const fallbackProfile = buildLocalProfile(nextUser);
        setProfile(fallbackProfile);
        writeLocalJson(LOCAL_PROFILE_KEY, fallbackProfile);
        setLocalFirstMode(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribeAuth();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading, localFirstMode, profile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, localFirstMode } = useAuth();

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

  return (
    <>
      {localFirstMode && (
        <div className="sticky top-0 z-50 px-4 pt-4">
          <div className="mx-auto max-w-5xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-sm">
            Cloud profile sync is unavailable. Nix StudyOS is running in local-first mode.
          </div>
        </div>
      )}
      {children}
    </>
  );
};

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
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
      await signInWithEmail({ email, password });
    } catch (err) {
      console.error('Sign-in failed:', getSafeErrorDetail(err));
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
      await signUpWithEmailAndUsername({ username, email: signupEmail, password });
      setInfo('Account created. Cloud profile sync may stay local-first until Firestore is available.');
    } catch (err) {
      console.error('Account creation failed:', getSafeErrorDetail(err));
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
              Sign in with email and password, then continue in local-first mode while Firestore sync is postponed.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              <InfoPill label="Login" value="Firebase Auth email/password" />
              <InfoPill label="Profile" value="Falls back to local storage" />
              <InfoPill label="Tasks + logs" value="Use local-first fallback" />
              <InfoPill label="Marks engine" value="Already local-first" />
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
                placeholder="Optional cloud username if Firestore becomes available later"
                autoComplete="username"
              />
              <Field
                label="Email"
                value={signupEmail}
                onChange={setSignupEmail}
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

          <p className="text-xs text-slate-400 mt-5">
            Username-based sign-in is paused for this phase. Use email and password, and the app will keep a local profile if cloud sync is unavailable.
          </p>

          {error && <StatusMessage tone="error" message={error} />}
          {info && <StatusMessage tone="ok" message={info} />}
        </section>
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

function buildLocalProfile(user: FirebaseUser): UserProfileRecord {
  const storedProfile = readLocalJson<Partial<UserProfileRecord> | null>(LOCAL_PROFILE_KEY, null);
  const email = user.email?.trim().toLowerCase() || '';
  const emailPrefix = email.split('@')[0] || 'student';
  const username = storedProfile?.username || storedProfile?.usernameLowercase || emailPrefix;
  const now = new Date().toISOString();

  return {
    uid: user.uid,
    email,
    displayName: storedProfile?.displayName || user.displayName || emailPrefix,
    username,
    usernameLowercase: username.toLowerCase(),
    authProvider: 'password',
    createdAt: storedProfile?.createdAt || now,
    updatedAt: now,
  };
}

function getAuthMessage(error: unknown) {
  const maybeCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';

  switch (maybeCode) {
    case 'username-taken':
      return 'Username already taken.';
    case 'invalid-username':
      return 'Invalid username. Use 3-24 lowercase letters, numbers, underscores, or hyphens.';
    case 'auth-timeout':
    case 'profile-timeout':
      return 'The request took too long. Check your connection and try again.';
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
    case 'permission-denied':
    case 'auth/insufficient-permission':
      return 'Permission denied. Check Firebase setup.';
    default:
      return error instanceof Error ? error.message : 'Authentication failed.';
  }
}

function getSafeErrorDetail(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }

  if (isFirestoreUnavailableError(error)) {
    return 'firestore-unavailable';
  }

  return error instanceof Error ? error.message : String(error);
}
