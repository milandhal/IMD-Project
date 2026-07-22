import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ForecastChart } from '../components/Charts';
import { getRiskColor, getDisplayName } from '../utils/helpers';
import { Brain, Target, TrendingUp } from 'lucide-react';

const DISTRICTS = [
  'All', 'Angul', 'Balangir', 'Baleshwar', 'Bargarh', 'Bhadrak', 'Boudh',
  'Cuttack', 'Debagarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghapur',
  'Jajapur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar',
  'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangapur', 'Nayagarh',
  'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
];

export default function ForecastPage() {
  const { forecast, darkMode, mlAccuracy } = useApp();
  const [selectedDist, setSelectedDist] = useState('Khordha');

  // Get tomorrow's forecast for all districts
  const tomorrow = forecast?.filter(f => {
    const dates = [...new Set(forecast.map(d => d.forecastDate))].sort();
    return f.forecastDate === dates[0];
  }) || [];

  const mlCards = [
    { label: 'Temperature Model R²', value: (mlAccuracy.temp * 100).toFixed(1) + '%', icon: Brain, color: '#7c3aed' },
    { label: 'Heat Index Model R²', value: (mlAccuracy.hi * 100).toFixed(1) + '%', icon: Target, color: '#059669' },
    { label: 'Forecast Horizon', value: '7 Days', icon: TrendingUp, color: '#005A9C' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          📅 Weather Forecast & ML Predictions
        </h1>
        <select
          value={selectedDist}
          onChange={e => setSelectedDist(e.target.value)}
          className={`px-3 py-2 rounded-xl border text-sm focus:outline-none
            ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-700'}`}
        >
          {DISTRICTS.filter(d => d !== 'All').map(d => <option key={d} value={d}>{getDisplayName(d)}</option>)}
        </select>
      </div>

      {/* ML Accuracy Cards */}
      <div className="grid grid-cols-3 gap-4">
        {mlCards.map(({ label, value, icon: Icon, color }) => (
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

      {/* Forecast Chart */}
      <ForecastChart data={forecast} district={selectedDist} />

      {/* Tomorrow's District Forecast Table */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className={`px-5 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            📋 Tomorrow's Forecast — All Districts
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                {['District', 'Pred. Temp (°C)', 'Pred. Heat Index', 'Risk', 'Confidence'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tomorrow.map((row, i) => {
                const color = getRiskColor(row.riskCategory);
                return (
                  <tr key={i} className={`border-b last:border-0 ${darkMode ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'} transition-colors`}>
                    <td className={`px-4 py-3 font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{getDisplayName(row.district)}</td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{row.predictedTemperature}°C</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color }}>{row.predictedHeatIndex}°C</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color, background: color + '20' }}>
                        {row.riskCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: row.confidence + '%' }} />
                        </div>
                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{row.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
