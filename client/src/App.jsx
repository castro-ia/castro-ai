import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Home from './pages/Home';
import Equipo from './pages/Equipo';
import Crm from './pages/Crm';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/crm" element={<Crm />} />
        <Route path="/tareas" element={<Tasks />} />
        <Route path="/ajustes" element={<Settings />} />
      </Route>
    </Routes>
  );
}
