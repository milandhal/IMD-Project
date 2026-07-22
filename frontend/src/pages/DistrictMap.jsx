import { useApp } from '../context/AppContext';
import OdishaMap from '../components/OdishaMap';

export default function DistrictMapPage() {
  const { darkMode } = useApp();

  return (
    <div className="space-y-6">
      <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        🗺️ Odisha District Heat Index Map
      </h1>
      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        Interactive map showing real-time heat index levels for all 30 districts of Odisha. Hover to preview, click for full details.
      </p>
      <OdishaMap height="calc(100vh - 220px)" className="min-h-[500px]" />
    </div>
  );
}
