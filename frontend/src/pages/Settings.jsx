import { useApp } from '../context/AppContext';
import { Moon, Sun, RefreshCw, Wifi, Database, Brain, MapPin } from 'lucide-react';

export default function Settings() {
  const {
    darkMode, setDarkMode,
    sidebarCollapsed, setSidebarCollapsed,
    apiStatus, lastUpdated, mlAccuracy,
    handleRefresh, loading,
  } = useApp();

  const settingsSections = [
    {
      title: 'Appearance',
      icon: darkMode ? Moon : Sun,
      items: [
        {
          label: 'Dark Mode',
          description: 'Toggle between light and dark theme',
          control: (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
          ),
        },
        {
          label: 'Collapsed Sidebar',
          description: 'Start with sidebar collapsed',
          control: (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`relative w-12 h-6 rounded-full transition-colors ${sidebarCollapsed ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${sidebarCollapsed ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
          ),
        },
      ],
    },
    {
      title: 'Data & API',
      icon: Wifi,
      items: [
        {
          label: 'API Status',
          description: 'Backend connection status',
          control: (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full
              ${apiStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {apiStatus === 'online' ? 'Connected' : 'Offline'}
            </span>
          ),
        },
        {
          label: 'Refresh Data',
          description: 'Force fetch latest weather from OpenWeather or simulation',
          control: (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          ),
        },
        {
          label: 'Auto-Refresh Interval',
          description: 'Dashboard refreshes every 10 minutes automatically',
          control: <span className="text-sm text-slate-500">10 min</span>,
        },
        {
          label: 'Last Updated',
          description: 'Most recent data fetch timestamp',
          control: (
            <span className="text-sm text-slate-500">
              {lastUpdated ? lastUpdated.toLocaleString('en-IN') : 'Never'}
            </span>
          ),
        },
      ],
    },
    {
      title: 'Machine Learning',
      icon: Brain,
      items: [
        {
          label: 'Temperature Model R²',
          description: 'Random Forest regression accuracy on historical data',
          control: <span className="text-sm font-bold text-violet-600">{(mlAccuracy.temp * 100).toFixed(1)}%</span>,
        },
        {
          label: 'Heat Index Model R²',
          description: 'Random Forest regression accuracy on historical data',
          control: <span className="text-sm font-bold text-emerald-600">{(mlAccuracy.hi * 100).toFixed(1)}%</span>,
        },
        {
          label: 'Forecast Horizon',
          description: 'Number of days predicted ahead',
          control: <span className="text-sm text-slate-500">7 days</span>,
        },
      ],
    },
    {
      title: 'Coverage',
      icon: MapPin,
      items: [
        {
          label: 'State',
          description: 'Geographic coverage',
          control: <span className="text-sm font-semibold text-blue-600">Odisha, India</span>,
        },
        {
          label: 'Districts Monitored',
          description: 'All district headquarters covered',
          control: <span className="text-sm text-slate-500">30 districts</span>,
        },
        {
          label: 'Data Sources',
          description: 'Live weather and historical records',
          control: (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Database size={14} />
              OpenWeather API / CSV fallback
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          ⚙️ Settings
        </h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Configure dashboard appearance, data refresh, and view system information.
        </p>
      </div>

      {settingsSections.map(({ title, icon: Icon, items }) => (
        <div
          key={title}
          className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
        >
          <div className={`px-5 py-4 border-b flex items-center gap-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <Icon size={18} className="text-blue-600" />
            <h2 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.map(({ label, description, control }) => (
              <div key={label} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{label}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
                </div>
                <div className="flex-shrink-0">{control}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className={`text-xs text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        Odisha Heat Index Monitoring & Early Warning Dashboard · IMD-inspired design · v1.0.0
      </p>
    </div>
  );
}
