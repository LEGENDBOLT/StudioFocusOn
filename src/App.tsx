import React, { useState, useCallback, useEffect } from 'react';
import Timer from './components/Timer';
import Analytics from './components/Analytics';
import Chatbot from './components/Chatbot';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import FeedbackModal from './components/FeedbackModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { View } from './types';
import type { StudySession, PerformanceMetrics, TimerProfile } from './types';
import { resetGeminiClients } from './services/geminiService';


const defaultProfiles: TimerProfile[] = [
  { id: 'default', name: 'Pomodoro Classico', studyTime: 45 * 60, breakTime: 15 * 60 }
];

function App() {
  const [currentView, setCurrentView] = useState<View>(View.Timer);
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('studySessions', []);
  const [profiles, setProfiles] = useLocalStorage<TimerProfile[]>('timerProfiles', defaultProfiles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSessionDuration, setLastSessionDuration] = useState(45);

  // FIX: Removed local storage and input state for API key to align with guidelines.
  const [isKeyReady, setIsKeyReady] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  
  useEffect(() => {
    const checkKey = async () => {
        setIsCheckingKey(true);
        // FIX: Per guidelines, check for AI Studio environment to prompt for key selection.
        if (window.aistudio) {
            try {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsKeyReady(hasKey);
            } catch (e) {
                console.error("Errore nel controllo della API key:", e);
                setIsKeyReady(false);
            }
        } else {
            // Outside AI Studio, assume the key is in env vars as per guidelines.
            setIsKeyReady(true);
        }
        setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleSelectKeyFromStudio = async () => {
    if (!window.aistudio) {
        alert("Funzionalità di selezione chiave non disponibile in questo ambiente.");
        return;
    }
    try {
        resetGeminiClients();
        await window.aistudio.openSelectKey();
        // Per guidelines, assume key selection was successful to avoid race conditions.
        setIsKeyReady(true);
    } catch (e) {
        console.error("Errore nell'apertura della selezione API key:", e);
    }
  };
  
  const handleReSelectKey = async () => {
    // FIX: Re-selection logic updated for AI Studio or standard environments.
    if (window.aistudio) {
        await handleSelectKeyFromStudio();
    } else {
        alert("La API Key è gestita tramite variabili d'ambiente. Per cambiarla, aggiorna la configurazione del tuo ambiente.");
    }
  };


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
                  onSelectKey={handleReSelectKey}
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

  if (isCheckingKey) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
            <p className="mt-4">Verifica API Key...</p>
        </div>
    );
  }

  if (!isKeyReady) {
    // FIX: UI updated to only show AI Studio key selection, per guidelines.
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-4">Benvenuto in Focus Flow</h1>
          <p className="text-slate-400 mb-6">
            Per utilizzare le funzionalità AI, è necessario selezionare una API Key di Google AI tramite AI Studio.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleSelectKeyFromStudio}
              className="w-full py-3 px-5 font-semibold rounded-full transition-all duration-200 bg-sky-500 hover:bg-sky-600 text-white"
            >
              Seleziona da AI Studio
            </button>
          </div>
          
          <p className="text-xs text-slate-500 mt-6">
            {/* FIX: Updated link and text to match billing documentation guidelines. */}
            L'utilizzo dell'API ha un livello gratuito, ma l'uso intensivo potrebbe comportare costi. Assicurati di aver abilitato la fatturazione e di consultare la <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">documentazione sulla fatturazione</a> per evitare costi imprevisti.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased flex flex-col font-sans">
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
