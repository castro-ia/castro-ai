import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Home from './pages/Home';
import Crm from './pages/Crm';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import AgentChat from './pages/AgentChat';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/crm" element={<Crm />} />
        <Route path="/tareas" element={<Tasks />} />
        <Route path="/ajustes" element={<Settings />} />
      </Route>
      <Route path="/chat/:agentId" element={<AgentChat />} />
    </Routes>
  );
}
