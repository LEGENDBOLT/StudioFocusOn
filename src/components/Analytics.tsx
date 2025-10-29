
import React, { useMemo, useState, useCallback } from 'react';
import type { StudySession } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAnalyticsSummary } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface AnalyticsProps {
  sessions: StudySession[];
}

const Analytics: React.FC<AnalyticsProps> = ({ sessions }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chartData = useMemo(() => {
    return sessions.map(s => ({
      name: new Date(s.date).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }),
      Produttività: s.productivity,
      Felicità: s.happiness,
      Stress: s.stress,
      Stanchezza: s.tiredness,
    }));
  }, [sessions]);

  const handleGetSummary = useCallback(async () => {
    setIsLoading(true);
    const result = await getAnalyticsSummary(sessions);
    setSummary(result);
    setIsLoading(false);
  }, [sessions]);

  return (
    <div className="space-y-8 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-white">Le tue Performance</h1>
      
      {sessions.length < 2 ? (
        <div className="flex-grow flex items-center justify-center bg-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400">Completa almeno due sessioni di studio per vedere i tuoi progressi qui.</p>
        </div>
      ) : (
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis domain={[1, 5]} stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Legend />
              <Line type="monotone" dataKey="Produttività" stroke="#38bdf8" strokeWidth={2} />
              <Line type="monotone" dataKey="Felicità" stroke="#34d399" strokeWidth={2} />
              <Line type="monotone" dataKey="Stress" stroke="#f87171" strokeWidth={2} />
              <Line type="monotone" dataKey="Stanchezza" stroke="#facc15" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex-grow flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-4">Analisi AI</h2>
        <div className="bg-slate-800 rounded-xl p-6 space-y-4 flex-grow flex flex-col">
            {isLoading ? (
                 <div className="flex-grow flex items-center justify-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
                 </div>
            ) : summary ? (
                <div className="text-slate-300 whitespace-pre-wrap font-mono text-sm overflow-y-auto">{summary}</div>
            ) : (
                 <div className="flex-grow flex items-center justify-center text-center text-slate-400">
                    <p>Premi il pulsante qui sotto per ottenere un'analisi approfondita delle tue abitudini di studio.</p>
                 </div>
            )}
             <button
                onClick={handleGetSummary}
                disabled={isLoading || sessions.length === 0}
                className="w-full mt-auto flex items-center justify-center gap-2 py-3 px-6 text-lg font-semibold rounded-full transition-all duration-200 bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
            >
                <SparklesIcon />
                {isLoading ? 'Analizzando...' : 'Genera Analisi'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
