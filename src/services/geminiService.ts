import { GoogleGenAI, Chat } from "@google/genai";
import type { StudySession } from '../types';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;
let currentApiKey: string | null = null;

function getAiClient(): GoogleGenAI {
    // FIX: Per guidelines, API key must be obtained exclusively from process.env.API_KEY.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
        throw new Error("API key non trovata. Per favore, seleziona una API Key o assicurati che la variabile d'ambiente API_KEY sia impostata.");
    }

    // Se il client AI esiste e la chiave è la stessa, riutilizzalo
    // This is useful in environments like AI Studio where the key can be updated.
    if (ai && apiKey === currentApiKey) {
        return ai;
    }

    // La chiave è cambiata o non è inizializzata, crea un nuovo client
    currentApiKey = apiKey;
    ai = new GoogleGenAI({ apiKey });
    chat = null; // Resetta anche il client di chat se il client AI viene resettato
    return ai;
}

export function resetGeminiClients() {
  ai = null;
  chat = null;
  currentApiKey = null;
}

function getChat(): Chat {
  if (chat) {
    return chat;
  }
  const client = getAiClient();
  chat = client.chats.create({
    model: 'gemini-flash-lite-latest',
    config: {
      systemInstruction: `You are 'Focus', a friendly and encouraging mental coach for students. Your goal is to help users with their study habits, manage stress, and stay motivated. Provide concise, positive, and actionable advice. Keep your responses brief, in Italian, and easy to understand.`,
    },
  });
  return chat;
}

export const getChatResponse = async (message: string): Promise<string> => {
  try {
    const chatInstance = getChat();
    const response = await chatInstance.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Errore nella risposta della chat:", error);
    resetGeminiClients(); // Resetta il client in caso di errore, potrebbe essere un problema di chiave
    // FIX: Updated error message to reflect new API key handling.
    return "Oops! Qualcosa è andato storto. Potrebbe essere un problema con la API Key. Se sei in AI Studio, prova a selezionarne una nuova dalle impostazioni.";
  }
};

export const getAnalyticsSummary = async (sessions: StudySession[]): Promise<string> => {
  if (sessions.length === 0) {
    return "Non ci sono ancora abbastanza dati per un'analisi. Completa qualche sessione di studio!";
  }

  const prompt = `Sei un analista di dati specializzato nella produttività degli studenti. Analizza i seguenti dati della sessione di studio forniti in formato JSON. Identifica le tendenze in stress, stanchezza, felicità e produttività. Fornisci un riepilogo conciso delle prestazioni dell'utente e offri 3 consigli specifici e attuabili per migliorare. Rivolgiti direttamente all'utente in tono di supporto e in italiano.

Dati:
${JSON.stringify(sessions, null, 2)}
`;

  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Errore nel riepilogo dell'analisi:", error);
    resetGeminiClients(); // Resetta il client in caso di errore
    // FIX: Updated error message to reflect new API key handling.
    return "Impossibile generare l'analisi in questo momento. Potrebbe essere un problema con la API Key. Se sei in AI Studio, per favore riprova o seleziona una nuova chiave dalle impostazioni.";
  }
};
