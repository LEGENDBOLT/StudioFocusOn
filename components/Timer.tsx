import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { TimerProfile } from '../types';

interface TimerProps {
  onStudySessionEnd: (duration: number) => void;
  profiles: TimerProfile[];
  onAddProfile: (profile: Omit<TimerProfile, 'id'>) => void;
}

const Timer: React.FC<TimerProps> = ({ onStudySessionEnd, profiles, onAddProfile }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => (profiles && profiles.length > 0 ? profiles[0].id : 'default'));

  const selectedProfile = useMemo(() =>
    profiles.find(p => p.id === selectedProfileId) || (profiles && profiles.length > 0 ? profiles[0] : null),
  [selectedProfileId, profiles]
  );
  
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [time, setTime] = useState(selectedProfile ? selectedProfile.studyTime : 0);
  const [initialTime, setInitialTime] = useState(selectedProfile ? selectedProfile.studyTime : 0);
  const [isRunning, setIsRunning] = useState(false);

  const [showCreator, setShowCreator] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newStudyMins, setNewStudyMins] = useState(45);
  const [newBreakMins, setNewBreakMins] = useState(15);


  useEffect(() => {
    if (!isRunning) {
        // When profile changes while paused, update timer
        const newTime = mode === 'study' ? selectedProfile.studyTime : selectedProfile.breakTime;
        setTime(newTime);
        setInitialTime(newTime);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfile, isRunning]);


  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          if (mode === 'study') {
            onStudySessionEnd(initialTime);
            setMode('break');
            setTime(selectedProfile.breakTime);
            setInitialTime(selectedProfile.breakTime);
          } else {
            setMode('study');
            setTime(selectedProfile.studyTime);
            setInitialTime(selectedProfile.studyTime);
          }
          setIsRunning(false);
          new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg").play();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, initialTime, onStudySessionEnd, selectedProfile]);

  const toggleTimer = useCallback(() => setIsRunning(prev => !prev), []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    const newTime = mode === 'study' ? selectedProfile.studyTime : selectedProfile.breakTime;
    setTime(newTime);
    setInitialTime(newTime);
  }, [mode, selectedProfile]);

  const extendTime = useCallback(() => {
    const extension = mode === 'study' ? 15 * 60 : 5 * 60;
    setTime(t => t + extension);
    setInitialTime(t => t + extension);
  }, [mode]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setIsRunning(false);
      setSelectedProfileId(e.target.value);
  }

  const handleSaveNewProfile = () => {
    if (newProfileName.trim() && newStudyMins > 0 && newBreakMins > 0) {
        onAddProfile({
            name: newProfileName,
            studyTime: newStudyMins * 60,
            breakTime: newBreakMins * 60
        });
        setNewProfileName('');
        setNewStudyMins(45);
        setNewBreakMins(15);
        setShowCreator(false);
    }
  }

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const progress = useMemo(() => (initialTime - time) / initialTime * 100, [time, initialTime]);

  const timerColor = mode === 'study' ? 'text-sky-400' : 'text-emerald-400';
  const progressBg = mode === 'study' ? 'bg-sky-400' : 'bg-emerald-400';

  if (!selectedProfile) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-slate-400">Caricamento profili...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start h-full text-center">
      
      {/* Profile Manager */}
      <div className="w-full max-w-xs bg-slate-800 p-4 rounded-xl mb-6">
        <h3 className="font-semibold text-white mb-2">Profilo Timer</h3>
        {!showCreator ? (
             <div className="flex gap-2">
                <select value={selectedProfileId} onChange={handleProfileChange} className="flex-grow bg-slate-700 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none">
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button onClick={() => setShowCreator(true)} className="bg-sky-500 rounded-md px-3 text-lg font-bold hover:bg-sky-600">+</button>
             </div>
        ) : (
            <div className="space-y-3">
                <input type="text" placeholder="Nome Profilo" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} className="w-full bg-slate-700 rounded-md py-2 px-3 text-white placeholder-slate-400" />
                <div className="flex gap-2 text-sm">
                    <input type="number" placeholder="Studio (min)" value={newStudyMins} onChange={e => setNewStudyMins(Number(e.target.value))} className="w-1/2 bg-slate-700 rounded-md py-2 px-3 text-white placeholder-slate-400" />
                    <input type="number" placeholder="Pausa (min)" value={newBreakMins} onChange={e => setNewBreakMins(Number(e.target.value))} className="w-1/2 bg-slate-700 rounded-md py-2 px-3 text-white placeholder-slate-400" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowCreator(false)} className="flex-1 bg-slate-600 rounded-md py-2 text-sm">Annulla</button>
                    <button onClick={handleSaveNewProfile} className="flex-1 bg-sky-500 rounded-md py-2 text-sm">Salva</button>
                </div>
            </div>
        )}
      </div>

      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        <svg className="absolute w-full h-full" viewBox="0 0 100 100">
          <circle className="text-slate-700" strokeWidth="7" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
          <circle
            className={progressBg.replace('bg-', 'text-')}
            strokeWidth="7"
            strokeDasharray="283"
            strokeDashoffset={283 - (progress / 100) * 283}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="z-10">
          <h2 className={`text-6xl md:text-7xl font-bold ${timerColor}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </h2>
          <p className="text-slate-400 text-lg uppercase tracking-widest mt-2">
            {mode === 'study' ? 'Studio' : 'Pausa'}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col w-full max-w-xs space-y-4">
        <button
          onClick={toggleTimer}
          className={`w-full py-3 px-6 text-lg font-semibold rounded-full transition-all duration-200 ${
            isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-sky-500 hover:bg-sky-600'
          } text-white shadow-lg shadow-sky-500/30`}
        >
          {isRunning ? 'Pausa' : 'Inizia'}
        </button>
        <div className="flex gap-4">
          <button onClick={extendTime} className="flex-1 py-3 px-4 text-md font-semibold rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
            {mode === 'study' ? '+15 min Studio' : '+5 min Pausa'}
          </button>
          <button onClick={resetTimer} className="flex-1 py-3 px-4 text-md font-semibold rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;