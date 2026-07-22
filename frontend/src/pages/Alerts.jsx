import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRiskColor, getDisplayName, downloadCsv } from '../utils/helpers';
import { Search, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const RISK_ORDER = ['All', 'Extreme Danger', 'Danger', 'Extreme Caution', 'Caution'];

export default function AlertsPage() {
  const { alerts, darkMode } = useApp();
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');

  const filtered = (alerts || []).filter(a => {
    const matchSearch = a.district?.toLowerCase().includes(search.toLowerCase()) ||
                        getDisplayName(a.district)?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === 'All' || a.riskCategory === filterRisk;
    return matchSearch && matchRisk;
  });

  const riskCounts = {};
  (alerts || []).forEach(a => {
    riskCounts[a.riskCategory] = (riskCounts[a.riskCategory] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          ⚠️ Heat Alerts — Odisha
        </h1>
        <button
          onClick={() => downloadCsv(filtered, 'heat_alerts_odisha.csv')}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['Extreme Danger', 'Danger', 'Extreme Caution', 'Caution'].map(risk => {
          const color = getRiskColor(risk);
          const count = riskCounts[risk] || 0;
          return (
            <div key={risk} className={`rounded-2xl p-4 shadow-sm border cursor-pointer transition-all
              ${filterRisk === risk ? 'ring-2' : ''}
              ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
              style={{ '--tw-ring-color': color }}
              onClick={() => setFilterRisk(filterRisk === risk ? 'All' : risk)}
            >
              <p className="text-2xl font-bold" style={{ color }}>{count}</p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{risk}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-3 p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search size={14} className="text-slate-400" />
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
          {RISK_ORDER.map(r => <option key={r} value={r}>{r === 'All' ? 'All Risk Levels' : r}</option>)}
        </select>
      </div>

      {/* Alerts Table */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className={`px-5 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Showing {filtered.length} alert{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                {['#', 'District', 'Temp (°C)', 'Humidity (%)', 'Heat Index', 'Risk Level', 'Alert', 'Updated'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                    {alerts?.length === 0
                      ? '✅ All districts are in Normal condition. No active alerts.'
                      : 'No alerts match your filter criteria.'}
                  </td>
                </tr>
              ) : filtered.map((a, i) => {
                const color = getRiskColor(a.riskCategory);
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors
                      ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}
                  >
                    <td className={`px-4 py-3 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{i + 1}</td>
                    <td className={`px-4 py-3 font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{getDisplayName(a.district)}</td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{a.temperature}°C</td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{a.humidity}%</td>
                    <td className="px-4 py-3 font-bold text-sm" style={{ color }}>{a.heatIndex}°C</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color, background: color + '20' }}>
                        {a.riskCategory}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs max-w-[200px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {a.alertLevel}
                    </td>
                    <td className={`px-4 py-3 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
