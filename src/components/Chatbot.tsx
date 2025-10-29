import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatResponse } from '../services/geminiService';
import { usePromptLimiter } from '../hooks/usePromptLimiter';
import type { ChatMessage } from '../types';
import { SendIcon, BotIcon } from './icons';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Ciao! Sono Focus, il tuo mental coach. Come posso aiutarti a studiare meglio oggi?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isLimited, recordPrompt, remaining } = usePromptLimiter();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isLimited) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    recordPrompt();

    try {
      const responseText = await getChatResponse(input);
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', text: 'Oops! Qualcosa è andato storto. Riprova più tardi.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isLimited, recordPrompt]);


  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold text-white mb-4">Focus Coach</h1>
      <div className="flex-grow bg-slate-800 rounded-xl p-4 flex flex-col overflow-hidden">
        <div className="flex-grow space-y-4 overflow-y-auto pr-2">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                  <BotIcon />
                </div>
              )}
              <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-sky-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-300 rounded-bl-none'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                    <BotIcon />
                </div>
                <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-slate-700 text-slate-300 rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 border-t border-slate-700 pt-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLimited ? 'Hai esaurito i messaggi per oggi' : 'Chiedi qualcosa...'}
              className="flex-grow bg-slate-700 rounded-full py-2 px-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              disabled={isLoading || isLimited}
            />
            <button
              type="submit"
              disabled={isLoading || isLimited || !input.trim()}
              className="bg-sky-500 rounded-full w-10 h-10 flex items-center justify-center text-white transition-colors hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              <SendIcon />
            </button>
          </form>
           <p className="text-xs text-slate-500 text-center mt-2">
            {remaining} messaggi rimasti per oggi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;