import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BrainCircuit,
  Timer,
  LogOut,
  BookOpen,
  LineChart,
  CalendarDays,
  ShieldCheck,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { signOutUser } from '../../lib/firebase';
import { useAuth } from '../auth/AuthGuard';

const navItems = [
  { to: '/', icon: <LayoutDashboard size={21} />, label: 'Home' },
  { to: '/modules', icon: <BookOpen size={21} />, label: 'Modules' },
  { to: '/tasks', icon: <CheckSquare size={21} />, label: 'Tasks' },
  { to: '/marks', icon: <LineChart size={21} />, label: 'Marks' },
  { to: '/planner', icon: <CalendarDays size={21} />, label: 'Plan' },
  { to: '/mistakes', icon: <ClipboardList size={21} />, label: 'Mistakes' },
  { to: '/exam-vault', icon: <ShieldCheck size={21} />, label: 'Vault' },
  { to: '/settings', icon: <Settings size={21} />, label: 'Settings' },
];

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="nav-shell fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-[2rem] z-50 flex items-center gap-3 md:gap-5 max-w-[96vw] overflow-x-auto no-scrollbar">
      {navItems.map((item) => (
        <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
      ))}
      <div className="w-12 h-12 shrink-0 rounded-full maroon-gradient flex items-center justify-center -mt-8 shadow-lg shadow-stellenbosch-maroon/30 border-4 border-white/90">
         <NavLink to="/ai" className={({isActive}) => isActive ? 'text-stellenbosch-gold' : 'text-white'} aria-label="LexAI">
            <BrainCircuit size={24} />
         </NavLink>
      </div>
      <NavItem to="/timer" icon={<Timer size={21} />} label="Timer" />
      {user && (
        <button 
          onClick={() => signOutUser()}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-stellenbosch-maroon transition-colors px-2 shrink-0"
        >
          <LogOut size={21} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Exit</span>
        </button>
      )}
    </nav>
  );
};

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex flex-col items-center gap-1 transition-all px-2 shrink-0 ${isActive ? 'text-stellenbosch-maroon scale-105' : 'text-slate-400 hover:text-slate-600'}`
    }
  >
    {icon}
    <span className="text-[9px] uppercase font-bold tracking-wider">{label}</span>
  </NavLink>
);

export default Navbar;
