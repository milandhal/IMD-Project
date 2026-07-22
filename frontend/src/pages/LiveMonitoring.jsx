import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRiskColor, getRiskBgColor, getDisplayName, downloadCsv } from '../utils/helpers';
import { motion } from 'framer-motion';
import { Search, Download, Filter, Thermometer, Droplets, Wind, Activity } from 'lucide-react';

const RISK_ORDER = ['Extreme Danger', 'Danger', 'Extreme Caution', 'Caution', 'Normal'];

export default function LiveMonitoring() {
  const { liveWeather, darkMode, loading } = useApp();
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [sortBy, setSortBy] = useState('heatIndex');

  const filtered = (liveWeather || [])
    .filter(d => {
      const matchSearch = d.district?.toLowerCase().includes(search.toLowerCase()) ||
                          getDisplayName(d.district)?.toLowerCase().includes(search.toLowerCase());
      const matchRisk = filterRisk === 'All' || d.riskCategory === filterRisk;
      return matchSearch && matchRisk;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const statCards = [
    { label: 'Districts Monitored', value: liveWeather?.length || 0, icon: Activity, color: '#005A9C' },
    { label: 'Max Heat Index', value: Math.max(...(liveWeather?.map(d => d.heatIndex) || [0])) + '°C', icon: Thermometer, color: '#f97316' },
    { label: 'Avg Humidity', value: liveWeather?.length ? Math.round(liveWeather.reduce((a, b) => a + b.humidity, 0) / liveWeather.length) + '%' : '—', icon: Droplets, color: '#0ea5e9' },
    { label: 'Avg Wind', value: liveWeather?.length ? Math.round(liveWeather.reduce((a, b) => a + b.windSpeed, 0) / liveWeather.length) + ' km/h' : '—', icon: Wind, color: '#14b8a6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>⚡ Live Monitoring — All 30 Districts</h1>
        <button
          onClick={() => downloadCsv(liveWeather || [], 'live_weather_data.csv')}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          <Download size={14} /> Export All
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-2xl p-4 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '15' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-3 p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`text-sm w-full focus:outline-none bg-transparent ${darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-700'}`}
          />
        </div>
        <select
          value={filterRisk}
          onChange={e => setFilterRisk(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border text-sm focus:outline-none
            ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-700'}`}
        >
          <option value="All">All Risk Levels</option>
          {RISK_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border text-sm focus:outline-none
            ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-700'}`}
        >
          <option value="heatIndex">Sort by Heat Index</option>
          <option value="temperature">Sort by Temperature</option>
          <option value="humidity">Sort by Humidity</option>
          <option value="windSpeed">Sort by Wind Speed</option>
        </select>
      </div>

      {/* District Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 30 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d, i) => {
            const color = getRiskColor(d.riskCategory);
            const bg = getRiskBgColor(d.riskCategory);
            return (
              <motion.div
                key={d.district}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`rounded-2xl p-4 shadow-sm border hover:shadow-md transition-all cursor-pointer
                  ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500/40' : 'bg-white border-slate-100 hover:border-blue-200'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {getDisplayName(d.district)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Odisha</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color, background: color + '20' }}>
                    {d.riskCategory}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Heat Index</p>
                    <p className="text-2xl font-bold" style={{ color }}>{d.heatIndex}°C</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Temp</p>
                    <p className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{d.temperature}°C</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-400">Humidity</p>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{d.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Wind</p>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{d.windSpeed} km/h</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
