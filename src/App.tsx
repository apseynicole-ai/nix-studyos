import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard, AuthProvider } from './components/auth/AuthGuard';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import StudyAI from './pages/StudyAI';
import Timer from './pages/Timer';
import Modules from './pages/Modules';
import Marks from './pages/Marks';
import Planner from './pages/Planner';
import ExamVault from './pages/ExamVault';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/marks" element={<Marks />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/exam-vault" element={<ExamVault />} />
              <Route path="/ai" element={<StudyAI />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
            <Navbar />
          </div>
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  );
}
