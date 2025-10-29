import React from 'react';
import { View } from '../types';
import { TimerIcon, ChartIcon, MessageIcon, SettingsIcon } from './icons';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
    const activeClass = isActive ? 'text-sky-400' : 'text-slate-400 hover:text-sky-400';
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-colors ${activeClass}`}>
            {icon}
            <span className={`text-xs font-medium ${isActive ? 'text-sky-400' : 'text-slate-400'}`}>{label}</span>
        </button>
    )
};


const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700">
      <div className="container mx-auto px-4 h-16 max-w-lg flex justify-around items-center">
        <NavItem 
            icon={<TimerIcon />}
            label="Timer"
            isActive={currentView === View.Timer}
            onClick={() => setCurrentView(View.Timer)}
        />
        <NavItem 
            icon={<ChartIcon />}
            label="Analytics"
            isActive={currentView === View.Analytics}
            onClick={() => setCurrentView(View.Analytics)}
        />
         <NavItem 
            icon={<MessageIcon />}
            label="Coach"
            isActive={currentView === View.Chat}
            onClick={() => setCurrentView(View.Chat)}
        />
         <NavItem 
            icon={<SettingsIcon />}
            label="Impostazioni"
            isActive={currentView === View.Settings}
            onClick={() => setCurrentView(View.Settings)}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
