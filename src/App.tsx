import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard, AuthProvider } from './components/auth/AuthGuard';
import Navbar from './components/layout/Navbar';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Modules = lazy(() => import('./pages/Modules'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Marks = lazy(() => import('./pages/Marks'));
const Planner = lazy(() => import('./pages/Planner'));
const ExamVault = lazy(() => import('./pages/ExamVault'));
const MistakeBank = lazy(() => import('./pages/MistakeBank'));
const StudyAI = lazy(() => import('./pages/StudyAI'));
const Timer = lazy(() => import('./pages/Timer'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard>
          <div className="min-h-screen">
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/modules" element={<Modules />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/marks" element={<Marks />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/exam-vault" element={<ExamVault />} />
                <Route path="/mistakes" element={<MistakeBank />} />
                <Route path="/ai" element={<StudyAI />} />
                <Route path="/timer" element={<Timer />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
            <Navbar />
          </div>
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  );
}

const RouteLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center px-5 md:px-8">
    <div className="glass rounded-[2.5rem] px-8 py-10 text-center shadow-xl border border-slate-200/60">
      <div className="w-12 h-12 border-4 border-stellenbosch-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mb-2">route loader</p>
      <h1 className="font-display text-3xl text-stellenbosch-maroon">Loading Nix StudyOS...</h1>
    </div>
  </div>
);
