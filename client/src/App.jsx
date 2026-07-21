import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Home from './pages/Home';
import Equipo from './pages/Equipo';
import Crm from './pages/Crm';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import MorningBrief, { useMorningBrief } from './components/MorningBrief';
import { getCalendarToday } from './lib/api';

export default function App() {
  const [showBrief, setShowBrief] = useMorningBrief();
  const [todayEvents, setTodayEvents] = useState([]);

  useEffect(() => {
    if (!showBrief) return;
    getCalendarToday()
      .then((data) => setTodayEvents(data.events || []))
      .catch(() => setTodayEvents([]));
  }, [showBrief]);

  return (
    <>
      {showBrief && <MorningBrief events={todayEvents} onClose={() => setShowBrief(false)} />}
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/crm" element={<Crm />} />
          <Route path="/tareas" element={<Tasks />} />
          <Route path="/ajustes" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}
