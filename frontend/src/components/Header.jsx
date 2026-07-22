import { useState, useEffect } from 'react';
import { Moon, Sun, RefreshCw, Bell, Search, ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/helpers';

const DISTRICTS = [
  'All', 'Angul', 'Balangir', 'Baleshwar', 'Bargarh', 'Bhadrak', 'Boudh',
  'Cuttack', 'Debagarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghapur',
  'Jajapur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar',
  'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangapur', 'Nayagarh',
  'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
];

export default function Header({ title }) {
  const {
    darkMode, setDarkMode,
    sidebarCollapsed,
    selectedDistrict, setSelectedDistrict,
    lastUpdated, handleRefresh, loading, apiStatus, alerts
  } = useApp();

  const [time, setTime] = useState(new Date());
  const [search, setSearch] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await handleRefresh();
    setRefreshing(false);
  };

  const sidebarW = sidebarCollapsed ? 72 : 260;

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 flex items-center px-4 gap-3 border-b transition-all duration-300
        ${darkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'}
        shadow-sm backdrop-blur-sm`}
      style={{ left: sidebarW }}
    >
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className={`text-base font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          {title || 'Odisha Heat Index Monitoring'}
        </h1>
        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>

      {/* API Status */}
      <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border
        ${apiStatus === 'online'
          ? 'bg-green-50 text-green-700 border-green-200'
          : apiStatus === 'offline'
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }`}
      >
        {apiStatus === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
        {apiStatus === 'online' ? 'Live' : apiStatus === 'offline' ? 'Offline' : 'Connecting'}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <span className={`hidden lg:block text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Updated: {formatDateTime(lastUpdated)}
        </span>
      )}

      {/* State tag */}
      <span className="hidden md:flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
        🏛️ Odisha
      </span>

      {/* District Filter */}
      <div className="relative hidden sm:block">
        <select
          value={selectedDistrict}
          onChange={e => setSelectedDistrict(e.target.value)}
          className={`pl-3 pr-8 py-1.5 rounded-lg border text-xs font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400
            ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-700'}`}
        >
          {DISTRICTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
      </div>

      {/* Search */}
      <div className={`relative hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border
        ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-300'}`}
      >
        <Search size={14} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`text-xs w-32 focus:outline-none bg-transparent ${darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-700 placeholder:text-slate-400'}`}
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotif(!showNotif)}
          className={`relative p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
        >
          <Bell size={18} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
          {alerts?.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {alerts.length}
            </span>
          )}
        </button>

        {showNotif && (
          <div className={`absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl border z-50 overflow-hidden
            ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Heat Alerts ({alerts?.length || 0})
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts?.length > 0 ? alerts.slice(0, 5).map((a, i) => (
                <div key={i} className={`px-4 py-3 border-b last:border-0 ${darkMode ? 'border-slate-700/50' : 'border-slate-50'}`}>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{a.district}</p>
                  <p className="text-xs text-red-500">{a.riskCategory} — HI: {a.heatIndex}°C</p>
                </div>
              )) : (
                <p className={`p-4 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No active alerts.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={refreshing || loading}
        className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
        title="Refresh Data"
      >
        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
      </button>

      {/* Dark Mode */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 text-yellow-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        title="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0">
        IMD
      </div>
    </header>
  );
}
