import { useState, useEffect, useCallback } from 'react';
import { getKpis, saveKpis } from '../lib/db';
import { getCalendarStatus, getCalendarKpis } from '../lib/api';

export function useKpis() {
  const [kpis, setKpis] = useState(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    getKpis().then(setKpis);
    getCalendarStatus()
      .then((status) => setCalendarConnected(status.connected))
      .catch(() => setCalendarConnected(false));
  }, []);

  const updateKpi = useCallback(
    async (field, value) => {
      const next = { ...(kpis || {}), [field]: value };
      setKpis(next);
      await saveKpis(next);
    },
    [kpis]
  );

  const syncFromCalendar = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const { prelistings, tasaciones, captaciones, muestras, reservas, cierres } = await getCalendarKpis();
      const next = {
        ...(kpis || {}),
        prelistings,
        tasaciones,
        captaciones,
        muestras,
        reservas,
        cierres,
        lastSyncedAt: Date.now(),
      };
      setKpis(next);
      await saveKpis(next);
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  }, [kpis]);

  return { kpis, updateKpi, calendarConnected, syncing, syncError, syncFromCalendar };
}
