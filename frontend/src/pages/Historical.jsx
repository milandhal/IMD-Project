import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeatIndexTrend, TemperatureTrend, HumidityTrend } from '../components/Charts';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CHART_TOOLTIP_STYLE } from '../utils/helpers';

export default function HistoricalAnalysis() {
  const { historical, darkMode } = useApp();
  const [period, setPeriod] = useState('monthly');

  const daily = historical?.daily || [];
  const monthly = historical?.monthly || [];
  const seasonal = historical?.seasonal || [];

  const displayData = period === 'monthly' ? monthly : seasonal;
  const dateKey = period === 'monthly' ? 'month' : 'label';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          📚 Historical Analysis (2024–2026)
        </h1>
        <div className={`flex rounded-xl overflow-hidden border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          {[['monthly', 'Monthly'], ['seasonal', 'Seasonal']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-4 py-2 text-sm font-medium transition-colors
                ${period === key
                  ? 'bg-blue-600 text-white'
                  : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly/Seasonal Bar Chart */}
      <div className={`rounded-2xl p-5 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <h3 className={`font-semibold text-sm mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          📊 {period === 'monthly' ? 'Monthly' : 'Seasonal'} Temperature & Heat Index Summary
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
            <XAxis dataKey={dateKey} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false}
              tickFormatter={v => v?.length > 10 ? v.slice(0, 10) : v} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="°" />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="maxTemperature" name="Max Temp" fill="#ef4444" radius={[4,4,0,0]} />
            <Bar dataKey="avgTemperature" name="Avg Temp" fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="avgHeatIndex" name="Avg Heat Index" fill="#f97316" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 90-Day Daily Trend Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeatIndexTrend data={daily} />
        <TemperatureTrend data={daily} />
        <HumidityTrend data={daily} />
        <div className={`rounded-2xl p-5 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className={`font-semibold text-sm mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            📈 {period === 'monthly' ? 'Monthly' : 'Seasonal'} Avg Humidity
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
              <XAxis dataKey={dateKey} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false}
                tickFormatter={v => v?.slice(-7)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="avgHumidity" name="Avg Humidity" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
