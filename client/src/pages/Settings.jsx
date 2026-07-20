import { Header } from '../components/layout/Header';
import { ApiKeySection } from '../components/settings/ApiKeySection';
import { PromptsSection } from '../components/settings/PromptsSection';
import { BrandSection } from '../components/settings/BrandSection';

export default function Settings() {
  return (
    <div>
      <Header title="Ajustes" subtitle="API key, prompts y marca" />
      <div className="flex flex-col gap-6 px-4 py-4">
        <ApiKeySection />
        <PromptsSection />
        <BrandSection />
      </div>
    </div>
  );
}
