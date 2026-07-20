import { useState, useEffect, useCallback } from 'react';
import { getAllPromptOverrides, savePromptOverride, resetPromptOverride } from '../lib/db';

export function usePromptOverrides() {
  const [overrides, setOverrides] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAllPromptOverrides().then((all) => {
      setOverrides(all);
      setLoaded(true);
    });
  }, []);

  const setOverride = useCallback(async (agentId, systemPrompt) => {
    await savePromptOverride(agentId, systemPrompt);
    setOverrides((prev) => ({ ...prev, [agentId]: systemPrompt }));
  }, []);

  const resetOverride = useCallback(async (agentId) => {
    await resetPromptOverride(agentId);
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[agentId];
      return next;
    });
  }, []);

  return { overrides, loaded, setOverride, resetOverride };
}
