import React, { useState, useCallback } from 'react';
import Timer from './components/Timer';
import Analytics from './components/Analytics';
import Chatbot from './components/Chatbot';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import FeedbackModal from './components/FeedbackModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { View } from './types';
import type { StudySession, PerformanceMetrics, TimerProfile } from './types';

const defaultProfiles: TimerProfile[] = [
  { id: 'default', name: 'Pomodoro Classico', studyTime: 45 * 60, breakTime: 15 * 60 }
];

function App() {
  const [currentView, setCurrentView] = useState<View>(View.Timer);
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('studySessions', []);
  const [profiles, setProfiles] = useLocalStorage<TimerProfile[]>('timerProfiles', defaultProfiles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSessionDuration, setLastSessionDuration] = useState(45);

  if (!profiles || profiles.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-slate-400">Caricamento in corso...</p>
        </div>
    );
  }

  const handleStudySessionEnd = useCallback((duration: number) => {
    setLastSessionDuration(duration / 60);
    setIsModalOpen(true);
  }, []);

  const handleSaveSession = useCallback((metrics: PerformanceMetrics, notes: string) => {
    const newSession: StudySession = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      duration: lastSessionDuration,
      notes,
      ...metrics,
    };
    setSessions(prevSessions => [...prevSessions, newSession]);
    setIsModalOpen(false);
  }, [lastSessionDuration, setSessions]);
  
  const handleAddProfile = useCallback((profile: Omit<TimerProfile, 'id'>) => {
    const newProfile: TimerProfile = {
      id: new Date().toISOString(),
      ...profile
    };
    setProfiles(prev => [...prev, newProfile]);
  }, [setProfiles]);


  const renderView = () => {
    switch (currentView) {
      case View.Analytics:
        return <Analytics sessions={sessions} />;
      case View.Chat:
        return <Chatbot />;
      case View.Settings:
        return <Settings 
                  sessions={sessions} 
                  profiles={profiles} 
                  setSessions={setSessions}
                  setProfiles={setProfiles}
                />;
      case View.Timer:
      default:
        return <Timer 
                  onStudySessionEnd={handleStudySessionEnd} 
                  profiles={profiles}
                  onAddProfile={handleAddProfile}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      <main className="flex-grow container mx-auto px-4 py-8 max-w-lg">
        {renderView()}
      </main>
      <footer className="text-center text-xs text-slate-500 py-2">
        <p>Creata da Gabriele Ottonelli</p>
      </footer>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      {isModalOpen && (
        <FeedbackModal
          onSave={handleSaveSession}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
