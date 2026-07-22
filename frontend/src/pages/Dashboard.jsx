import { motion } from 'framer-motion';
import KPICards from '../components/KPICards';
import OdishaMap from '../components/OdishaMap';
import {
  HeatIndexTrend, TemperatureTrend, HumidityTrend, WindSpeedTrend,
  DistrictRankingChart, RiskDistributionChart, ForecastChart
} from '../components/Charts';
import { useApp } from '../context/AppContext';
import { getRiskColor, getRiskBgColor, getDisplayName, downloadCsv } from '../utils/helpers';
import { AlertTriangle, Download } from 'lucide-react';

function SectionTitle({ children, darkMode }) {
  return (
    <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      {children}
    </h2>
  );
}

function AlertsTable({ alerts, darkMode }) {
  const RISK_COLORS = {
    'Caution': '#ca8a04', 'Extreme Caution': '#ea580c',
    'Danger': '#dc2626', 'Extreme Danger': '#7f1d1d',
  };

  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className={`px-5 py-4 flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        <h3 className={`font-semibold text-sm flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          <AlertTriangle size={16} className="text-red-500" />
          Active Heat Alerts ({alerts?.length || 0})
        </h3>
        {alerts?.length > 0 && (
          <button
            onClick={() => downloadCsv(alerts, 'heat_alerts.csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors"
          >
            <Download size={12} /> Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
              {['District', 'Temp (°C)', 'Heat Index', 'Risk Level', 'Alert', 'Updated'].map(h => (
                <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!alerts?.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                  ✅ No active heat alerts. All districts are in normal condition.
                </td>
              </tr>
            ) : alerts.map((a, i) => {
              const color = RISK_COLORS[a.riskCategory] || '#16a34a';
              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors
                    ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}
                >
                  <td className={`px-4 py-3 font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {getDisplayName(a.district)}
                  </td>
                  <td className={`px-4 py-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{a.temperature}°C</td>
                  <td className={`px-4 py-3 text-sm font-bold`} style={{ color }}>
                    {a.heatIndex}°C
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color, background: color + '20' }}>
                      {a.riskCategory}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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
  );
}

export default function Dashboard() {
  const { dashboard, historical, forecast, alerts, darkMode } = useApp();
  const daily = historical?.daily || [];
  const rankings = dashboard?.districtRankings || [];
  const riskDist = dashboard?.riskDistribution || [];

  return (
    <div className="space-y-8">
      {/* Section 1: KPI Cards */}
      <section>
        <SectionTitle darkMode={darkMode}>📊 Key Performance Indicators</SectionTitle>
        <KPICards />
      </section>

      {/* Section 2: Map */}
      <section>
        <SectionTitle darkMode={darkMode}>🗺️ Odisha District Heat Index Map</SectionTitle>
        <OdishaMap />
      </section>

      {/* Section 3: Trend Charts */}
      <section>
        <SectionTitle darkMode={darkMode}>📈 Trend Analysis (Last 30 Days)</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HeatIndexTrend data={daily} />
          <TemperatureTrend data={daily} />
          <HumidityTrend data={daily} />
          <WindSpeedTrend data={daily} />
        </div>
      </section>

      {/* Section 4: Rankings + Risk Distribution */}
      <section>
        <SectionTitle darkMode={darkMode}>🏆 District Rankings & Risk Distribution</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DistrictRankingChart data={rankings} />
          <RiskDistributionChart data={riskDist} />
        </div>
      </section>

      {/* Section 5: Forecast */}
      <section>
        <SectionTitle darkMode={darkMode}>📅 7-Day Forecast</SectionTitle>
        <ForecastChart data={forecast} />
      </section>

      {/* Section 6: Active Alerts */}
      <section>
        <SectionTitle darkMode={darkMode}>⚠️ Active Heat Alerts</SectionTitle>
        <AlertsTable alerts={alerts} darkMode={darkMode} />
      </section>
    </div>
  );
}
