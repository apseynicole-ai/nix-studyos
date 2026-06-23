import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db, doc, getDoc, type UserProfileRecord } from '../../lib/firebase';
import { LOCAL_PROFILE_KEY, readLocalJson, writeLocalJson } from '../../lib/localData';
import { USER_ACADEMIC_PROFILE } from '../../data/baccllb';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  localFirstMode: boolean;
  profile: UserProfileRecord | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  localFirstMode: true,
  profile: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [localFirstMode, setLocalFirstMode] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const unsubscribeAuth = auth.onAuthStateChanged(async (nextUser) => {
      setUser(nextUser);
      setLoading(true);

      if (!nextUser) {
        const guestProfile = buildGuestProfile();
        if (!cancelled) {
          setProfile(guestProfile);
          setLocalFirstMode(true);
          setLoading(false);
        }
        return;
      }

      try {
        const snapshot = await Promise.race([
          getDoc(doc(db, 'users', nextUser.uid)),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Profile load timed out.')), 5000);
          }),
        ]);

        if (cancelled) return;

        const cloudProfile = (snapshot.data() as UserProfileRecord | undefined) || null;
        if (cloudProfile) {
          setProfile(cloudProfile);
          writeLocalJson(LOCAL_PROFILE_KEY, cloudProfile);
          setLocalFirstMode(false);
        } else {
          const localProfile = buildSignedInLocalProfile(nextUser);
          setProfile(localProfile);
          writeLocalJson(LOCAL_PROFILE_KEY, localProfile);
          setLocalFirstMode(true);
        }
      } catch (error) {
        console.error('Local-first profile fallback:', error instanceof Error ? error.message : String(error));
        if (cancelled) return;

        const localProfile = buildSignedInLocalProfile(nextUser);
        setProfile(localProfile);
        writeLocalJson(LOCAL_PROFILE_KEY, localProfile);
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
  const { loading, localFirstMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stellenbosch-cream">
        <div className="w-12 h-12 border-4 border-stellenbosch-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {localFirstMode && (
        <div className="sticky top-0 z-50 px-4 pt-4">
          <div className="local-first-banner">
            Local-first mode: your study data is saved on this device. Cloud sync can be added later.
          </div>
        </div>
      )}
      {children}
    </>
  );
};

function buildGuestProfile(): UserProfileRecord {
  const storedProfile = readLocalJson<Partial<UserProfileRecord> | null>(LOCAL_PROFILE_KEY, null);
  const username = storedProfile?.username || storedProfile?.usernameLowercase || 'guest';
  const displayName = meaningfulName(storedProfile?.displayName) || USER_ACADEMIC_PROFILE.preferredName || 'Nix';
  const now = new Date().toISOString();

  const guestProfile: UserProfileRecord = {
    uid: storedProfile?.uid || 'local-guest',
    email: storedProfile?.email || '',
    displayName,
    username,
    usernameLowercase: username.toLowerCase(),
    authProvider: 'password',
    createdAt: storedProfile?.createdAt || now,
    updatedAt: now,
  };

  writeLocalJson(LOCAL_PROFILE_KEY, guestProfile);
  return guestProfile;
}

function buildSignedInLocalProfile(user: FirebaseUser): UserProfileRecord {
  const storedProfile = readLocalJson<Partial<UserProfileRecord> | null>(LOCAL_PROFILE_KEY, null);
  const email = user.email?.trim().toLowerCase() || '';
  const emailPrefix = email.split('@')[0] || 'student';
  const username = storedProfile?.username || storedProfile?.usernameLowercase || user.displayName || emailPrefix;
  const now = new Date().toISOString();

  return {
    uid: user.uid,
    email,
    displayName: meaningfulName(user.displayName) || meaningfulName(storedProfile?.displayName) || emailPrefix,
    username,
    usernameLowercase: username.toLowerCase(),
    authProvider: 'password',
    createdAt: storedProfile?.createdAt || now,
    updatedAt: now,
  };
}

function meaningfulName(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toLowerCase() === 'guest') return null;
  return trimmed;
}
