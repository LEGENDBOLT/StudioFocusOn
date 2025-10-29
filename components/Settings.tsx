import React from 'react';
import type { StudySession, TimerProfile, BackupData } from '../types';

interface SettingsProps {
    sessions: StudySession[];
    profiles: TimerProfile[];
    setSessions: React.Dispatch<React.SetStateAction<StudySession[]>>;
    setProfiles: React.Dispatch<React.SetStateAction<TimerProfile[]>>;
}

const Settings: React.FC<SettingsProps> = ({ sessions, profiles, setSessions, setProfiles }) => {

    const handleExport = () => {
        const dataToExport: BackupData = {
            sessions,
            profiles,
        };
        const jsonString = `data:text/json;charset=utf-t,${encodeURIComponent(
            JSON.stringify(dataToExport, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const date = new Date().toISOString().split('T')[0];
        link.download = `focus-flow-backup-${date}.json`;
        link.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const confirmation = window.confirm(
            "Sei sicuro di voler importare i dati? Questa azione sovrascriverà tutte le sessioni e i profili attuali. Si consiglia di esportare i dati correnti prima di procedere."
        );

        if (!confirmation) {
            // Reset the input value so the same file can be selected again
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Il file non è valido.");
                }
                const data: BackupData = JSON.parse(text);

                // Basic validation
                if (Array.isArray(data.sessions) && Array.isArray(data.profiles)) {
                    setSessions(data.sessions);
                    setProfiles(data.profiles);
                    alert("Dati importati con successo!");
                } else {
                    throw new Error("Il formato del file di backup non è valido.");
                }
            } catch (error) {
                console.error("Errore durante l'importazione:", error);
                alert(`Impossibile importare il file. Assicurati che sia un backup valido. Errore: ${error instanceof Error ? error.message : 'sconosciuto'}`);
            } finally {
                 // Reset the input value
                event.target.value = '';
            }
        };
        reader.onerror = () => {
             alert("Si è verificato un errore durante la lettura del file.");
             event.target.value = '';
        }
        reader.readAsText(file);
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Impostazioni</h1>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-2">Gestione Dati</h2>
                <p className="text-slate-400 mb-6">
                    Salva i tuoi progressi in un file per tenerli al sicuro o per trasferirli su un altro dispositivo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleExport}
                        className="flex-1 py-3 px-4 text-md font-semibold rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                    >
                        Esporta i tuoi dati
                    </button>
                    
                    <label className="flex-1 py-3 px-4 text-md text-center font-semibold rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer">
                        Importa i tuoi dati
                        <input
                            type="file"
                            className="hidden"
                            accept=".json"
                            onChange={handleImport}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Settings;
