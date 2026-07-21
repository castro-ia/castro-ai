import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { ApiKeySection } from '../components/settings/ApiKeySection';
import { CalendarSection } from '../components/settings/CalendarSection';
import { PromptsSection } from '../components/settings/PromptsSection';
import { BrandSection } from '../components/settings/BrandSection';

export default function Settings() {
  const { openDrawer } = useOutletContext();

  return (
    <div>
      <Header title="Ajustes" subtitle="API key, calendario, prompts y marca" onMenuOpen={openDrawer} />
      <div className="flex flex-col gap-6 px-4 py-4">
        <ApiKeySection />
        <CalendarSection />
        <PromptsSection />
        <BrandSection />
      </div>
    </div>
  );
}
