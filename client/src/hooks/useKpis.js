import { useState, useEffect, useCallback } from 'react';
import { getKpis, saveKpis } from '../lib/db';

export function useKpis() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    getKpis().then(setKpis);
  }, []);

  const updateKpi = useCallback(
    async (field, value) => {
      const next = { ...(kpis || {}), [field]: value };
      setKpis(next);
      await saveKpis(next);
    },
    [kpis]
  );

  return { kpis, updateKpi };
}
