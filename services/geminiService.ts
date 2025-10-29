import { GoogleGenAI, Chat } from "@google/genai";
import type { StudySession } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

let chat: Chat | null = null;

function getChat(): Chat {
  if (chat) {
    return chat;
  }
  chat = ai.chats.create({
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
    console.error("Error getting chat response:", error);
    return "Oops! Qualcosa è andato storto. Riprova più tardi.";
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting analytics summary:", error);
    return "Impossibile generare l'analisi in questo momento. Per favore riprova.";
  }
};