import React, { useEffect, useState, createContext, useContext } from 'react';
import { auth, onSnapshot, doc, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  profile: any | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, profile: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        // Listen to profile
        const unsubProfile = onSnapshot(doc(db, 'users', user.uid), 
          (doc) => {
            setProfile(doc.data() || null);
          },
          (error) => {
            console.error("Profile fetch error:", error);
          }
        );
        return () => unsubProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stellenbosch-cream">
        <div className="w-12 h-12 border-4 border-stellenbosch-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stellenbosch-cream">
        <div className="max-w-md w-full glass p-8 rounded-3xl shadow-xl text-center">
          <h1 className="font-display text-4xl mb-2 text-stellenbosch-maroon">BAccLLB Study Pro</h1>
          <p className="text-slate-600 mb-8 italic">Your personalised Stellenbosch BAccLLB command centre</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => import('../../lib/firebase').then(m => m.signInWithGoogle())}
              className="w-full py-4 px-6 rounded-2xl bg-white border border-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-medium shadow-sm active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Continue with Google Account
            </button>
            <p className="text-xs text-slate-400">Use your student or personal Google account</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
