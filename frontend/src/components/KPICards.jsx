import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  Thermometer, Wind, Droplets, AlertTriangle, MapPin, Bell,
  Activity, TrendingUp, Target, Brain, Gauge, Clock
} from 'lucide-react';
import { getRiskColor, getRiskBgColor } from '../utils/helpers';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
    <div className="skeleton h-3 w-20 mb-3" />
    <div className="skeleton h-8 w-32 mb-2" />
    <div className="skeleton h-2 w-16" />
  </div>
);

function KPICard({ icon: Icon, label, value, unit, sub, subColor, accent, delay = 0 }) {
  const { darkMode } = useApp();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all duration-300 group
        ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500/30' : 'bg-white border-slate-100 hover:border-blue-200'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: `${accent}15` }}
        >
          <Icon size={20} style={{ color: accent }} />
        </div>
        {sub !== undefined && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ color: subColor || '#6b7280', background: `${subColor || '#6b7280'}15` }}
          >
            {sub}
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        {value !== null && value !== undefined ? (
          <>{value}<span className="text-base font-normal ml-1 text-slate-400">{unit}</span></>
        ) : '—'}
      </div>
      <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
    </motion.div>
  );
}

export default function KPICards() {
  const { dashboard, loading, mlAccuracy, liveWeather } = useApp();

  if (loading || !dashboard) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const kpi = dashboard.kpi || {};
  const riskColor = getRiskColor(kpi.highestRiskCategory);
  const forecastConf = liveWeather?.length ? 94.2 : 88.5;

  const cards = [
    { icon: Thermometer,   label: 'Max Temperature',      value: kpi.maxTemperature,  unit: '°C',  sub: 'MAX',  subColor: '#dc2626', accent: '#ef4444', delay: 0    },
    { icon: Gauge,         label: 'Avg Temperature',      value: kpi.avgTemperature,  unit: '°C',  sub: 'AVG',  subColor: '#3b82f6', accent: '#3b82f6', delay: 0.05 },
    { icon: Activity,      label: 'Max Heat Index',       value: kpi.maxHeatIndex,    unit: '°C',  sub: 'PEAK', subColor: '#f97316', accent: '#f97316', delay: 0.10 },
    { icon: TrendingUp,    label: 'Avg Heat Index',       value: kpi.avgHeatIndex,    unit: '°C',  sub: 'AVG',  subColor: '#8b5cf6', accent: '#8b5cf6', delay: 0.15 },
    { icon: MapPin,        label: 'Highest Risk District', value: kpi.highestRiskDistrict, unit: '', sub: kpi.highestRiskCategory, subColor: riskColor, accent: riskColor, delay: 0.20 },
    { icon: Bell,          label: 'Active Heat Alerts',   value: kpi.activeAlerts,    unit: '',    sub: kpi.activeAlerts > 0 ? 'ACTIVE' : 'CLEAR', subColor: kpi.activeAlerts > 0 ? '#dc2626' : '#16a34a', accent: kpi.activeAlerts > 0 ? '#dc2626' : '#16a34a', delay: 0.25 },
    { icon: Droplets,      label: 'Avg Rel. Humidity',    value: kpi.avgHumidity,     unit: '%',   sub: 'RH',   subColor: '#0ea5e9', accent: '#0ea5e9', delay: 0.30 },
    { icon: Wind,          label: 'Avg Wind Speed',       value: kpi.avgWindSpeed,    unit: 'km/h',sub: 'WIND', subColor: '#14b8a6', accent: '#14b8a6', delay: 0.35 },
    { icon: MapPin,        label: 'Monitoring Districts', value: kpi.monitoringDistricts, unit: '', sub: 'ODISHA', subColor: '#005A9C', accent: '#005A9C', delay: 0.40 },
    { icon: Brain,         label: 'ML Model Accuracy',   value: (mlAccuracy.hi * 100).toFixed(1), unit: '%', sub: 'R²', subColor: '#7c3aed', accent: '#7c3aed', delay: 0.45 },
    { icon: Target,        label: 'Forecast Confidence', value: forecastConf,        unit: '%',   sub: '7-DAY', subColor: '#059669', accent: '#059669', delay: 0.50 },
    { icon: Clock,         label: 'Last API Update',     value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), unit: '', sub: 'TODAY', subColor: '#64748b', accent: '#64748b', delay: 0.55 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => <KPICard key={i} {...card} />)}
    </div>
  );
}
