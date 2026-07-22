import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeatIndexTrend, TemperatureTrend, HumidityTrend, WindSpeedTrend } from '../components/Charts';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CHART_TOOLTIP_STYLE } from '../utils/helpers';

export default function HeatIndexAnalysis() {
  const { historical, darkMode } = useApp();
  const [period, setPeriod] = useState('daily');

  const daily = historical?.daily || [];
  const monthly = historical?.monthly || [];
  const seasonal = historical?.seasonal || [];

  const displayData = period === 'daily' ? daily
    : period === 'monthly' ? monthly
    : seasonal;

  const dateKey = period === 'daily' ? 'date' : period === 'monthly' ? 'month' : 'label';

  // Compute 7-day moving average for heat index
  const withMA = daily.map((d, i, arr) => {
    if (i < 6) return { ...d, movingAvg: null };
    const window = arr.slice(i - 6, i + 1);
    const avg = window.reduce((s, r) => s + r.avgHeatIndex, 0) / 7;
    return { ...d, movingAvg: Math.round(avg * 10) / 10 };
  });

  const periods = [
    { key: 'daily', label: 'Daily (90 days)' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'seasonal', label: 'Seasonal' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          🔥 Heat Index Analysis
        </h1>
        <div className={`flex rounded-xl overflow-hidden border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors
                ${period === p.key
                  ? 'bg-blue-600 text-white'
                  : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Moving Average Chart */}
      <div className={`rounded-2xl p-5 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <h3 className={`font-semibold text-sm mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          📉 Heat Index with 7-Day Moving Average
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={withMA.slice(-60)}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false}
              tickFormatter={v => v?.slice(5)} interval={6} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="°" />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="avgHeatIndex" name="Avg Heat Index" stroke="#f97316" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="movingAvg" name="7-Day Moving Avg" stroke="#3b82f6" strokeWidth={2.5} dot={false} strokeDasharray="0" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Period-Based Charts */}
      <div className={`rounded-2xl p-5 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <h3 className={`font-semibold text-sm mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          📊 {period === 'daily' ? 'Daily' : period === 'monthly' ? 'Monthly' : 'Seasonal'} Max Temperature vs Heat Index
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={displayData.slice(-24)}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
            <XAxis dataKey={dateKey} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false}
              tickFormatter={v => v?.slice(5) || v} interval={period === 'daily' ? 6 : 0} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="°" />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="maxTemperature" name="Max Temp" fill="#ef4444" radius={[4,4,0,0]} />
            <Bar dataKey="avgHeatIndex" name="Avg Heat Index" fill="#f97316" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4 Trend Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeatIndexTrend data={daily} />
        <TemperatureTrend data={daily} />
        <HumidityTrend data={daily} />
        <WindSpeedTrend data={daily} />
      </div>
    </div>
  );
}
