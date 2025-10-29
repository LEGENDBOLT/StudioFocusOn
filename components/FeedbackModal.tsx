
import React, { useState } from 'react';
import type { PerformanceMetrics } from '../types';

interface FeedbackModalProps {
  onSave: (metrics: PerformanceMetrics, notes: string) => void;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onSave, onClose }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    stress: 3,
    tiredness: 3,
    happiness: 3,
    productivity: 3,
  });
  const [notes, setNotes] = useState('');

  const handleMetricChange = (metric: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [metric]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(metrics, notes);
  };

  const RatingInput = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
    <div className="mb-4">
      <label className="block text-slate-300 mb-2 capitalize">{label}</label>
      <div className="flex justify-between items-center">
        {[1, 2, 3, 4, 5].map(v => (
          <button
            type="button"
            key={v}
            onClick={() => onChange(v)}
            className={`w-10 h-10 rounded-full transition-all text-lg font-bold flex items-center justify-center ${
              value >= v ? 'bg-sky-500 text-white' : 'bg-slate-600 text-slate-300'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-4">Come è andata?</h2>
        <p className="text-slate-400 mb-6">Valuta la tua sessione di studio appena conclusa.</p>
        <form onSubmit={handleSubmit}>
          <RatingInput label="stress" value={metrics.stress} onChange={(v) => handleMetricChange('stress', v)} />
          <RatingInput label="stanchezza" value={metrics.tiredness} onChange={(v) => handleMetricChange('tiredness', v)} />
          <RatingInput label="felicità" value={metrics.happiness} onChange={(v) => handleMetricChange('happiness', v)} />
          <RatingInput label="produttività" value={metrics.productivity} onChange={(v) => handleMetricChange('productivity', v)} />
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aggiungi qualche nota..."
            className="w-full bg-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none mt-2"
            rows={3}
          ></textarea>
          
          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 text-md font-semibold rounded-full bg-slate-600 hover:bg-slate-500 text-slate-300 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 text-md font-semibold rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
