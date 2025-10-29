import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

// How many prompts can be sent per day
const DAILY_PROMPT_LIMIT = 100;

interface PromptLimitState {
  count: number;
  lastResetDate: string; // YYYY-MM-DD format
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const usePromptLimiter = () => {
  const [limitState, setLimitState] = useLocalStorage<PromptLimitState>('promptLimitState', {
    count: 0,
    lastResetDate: getTodayDateString(),
  });

  // Effect to check if the day has changed and reset the counter if needed.
  // This runs on component mount and whenever limitState changes.
  useEffect(() => {
    const today = getTodayDateString();
    if (limitState.lastResetDate !== today) {
      setLimitState({
        count: 0,
        lastResetDate: today,
      });
    }
  }, [limitState.lastResetDate, setLimitState]);

  const recordPrompt = useCallback(() => {
    setLimitState(prevState => {
      const today = getTodayDateString();
      // This check handles the case where a prompt is made on a new day before the useEffect has run
      if (prevState.lastResetDate !== today) {
        return { count: 1, lastResetDate: today };
      }
      return { ...prevState, count: prevState.count + 1 };
    });
  }, [setLimitState]);

  const remaining = Math.max(0, DAILY_PROMPT_LIMIT - limitState.count);
  const isLimited = remaining <= 0;

  return { isLimited, recordPrompt, remaining };
};
