import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { CalendarSection } from '../components/settings/CalendarSection';
import { BrandSection } from '../components/settings/BrandSection';

export default function Settings() {
  const { openDrawer } = useOutletContext();

  return (
    <div>
      <Header title="Ajustes" subtitle="Calendario y marca" onMenuOpen={openDrawer} />
      <div className="flex flex-col gap-6 px-4 py-4">
        <CalendarSection />
        <BrandSection />
      </div>
    </div>
  );
}
