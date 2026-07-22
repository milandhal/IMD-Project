import { useApp } from '../context/AppContext';
import { downloadCsv, getDisplayName, formatDateTime } from '../utils/helpers';
import { FileText, Download, Printer, Thermometer, Bell, TrendingUp } from 'lucide-react';

export default function Reports() {
  const { dashboard, liveWeather, alerts, forecast, historical, darkMode, lastUpdated } = useApp();
  const kpi = dashboard?.kpi || {};

  const reports = [
    {
      title: 'Live Weather — All Districts',
      description: 'Current temperature, humidity, wind, heat index and risk for all 30 districts.',
      icon: Thermometer,
      count: liveWeather?.length || 0,
      unit: 'districts',
      filename: 'odisha_live_weather.csv',
      data: (liveWeather || []).map(d => ({
        District: getDisplayName(d.district),
        Temperature: d.temperature,
        Humidity: d.humidity,
        WindSpeed: d.windSpeed,
        Pressure: d.pressure,
        Rainfall: d.rainfall,
        HeatIndex: d.heatIndex,
        RiskCategory: d.riskCategory,
        AlertLevel: d.alertLevel,
      })),
    },
    {
      title: 'Active Heat Alerts',
      description: 'Districts currently above Normal risk threshold with alert levels.',
      icon: Bell,
      count: alerts?.length || 0,
      unit: 'alerts',
      filename: 'odisha_heat_alerts.csv',
      data: (alerts || []).map(a => ({
        District: getDisplayName(a.district),
        Temperature: a.temperature,
        Humidity: a.humidity,
        HeatIndex: a.heatIndex,
        RiskCategory: a.riskCategory,
        AlertLevel: a.alertLevel,
        UpdatedAt: a.updatedAt,
      })),
    },
    {
      title: '7-Day Forecast',
      description: 'ML-predicted temperature and heat index for the next 7 days.',
      icon: TrendingUp,
      count: forecast?.length || 0,
      unit: 'records',
      filename: 'odisha_forecast.csv',
      data: (forecast || []).map(f => ({
        District: getDisplayName(f.district),
        ForecastDate: f.forecastDate,
        PredictedTemperature: f.predictedTemperature,
        PredictedHeatIndex: f.predictedHeatIndex,
        Confidence: f.confidence,
        RiskCategory: f.riskCategory,
      })),
    },
    {
      title: 'Historical Daily Summary',
      description: 'Daily aggregated temperature and heat index (last 90 days).',
      icon: FileText,
      count: historical?.daily?.length || 0,
      unit: 'days',
      filename: 'odisha_historical_daily.csv',
      data: (historical?.daily || []).map(d => ({
        Date: d.date,
        AvgTemperature: d.avgTemperature,
        MaxTemperature: d.maxTemperature,
        AvgHeatIndex: d.avgHeatIndex,
        AvgHumidity: d.avgHumidity,
        AvgWindSpeed: d.avgWindSpeed,
      })),
    },
  ];

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            📄 Reports & Export
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Download CSV reports or print a summary for official records.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-slate-700 text-white hover:bg-slate-800 transition-colors font-medium print:hidden"
        >
          <Printer size={14} /> Print / Save PDF
        </button>
      </div>

      {/* Executive Summary (printable) */}
      <div className={`rounded-2xl p-6 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          Executive Summary — Odisha State
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Max Temperature', value: `${kpi.maxTemperature ?? '—'}°C` },
            { label: 'Max Heat Index', value: `${kpi.maxHeatIndex ?? '—'}°C` },
            { label: 'Highest Risk District', value: kpi.highestRiskDistrict ?? '—' },
            { label: 'Active Alerts', value: kpi.activeAlerts ?? 0 },
            { label: 'Avg Temperature', value: `${kpi.avgTemperature ?? '—'}°C` },
            { label: 'Avg Heat Index', value: `${kpi.avgHeatIndex ?? '—'}°C` },
            { label: 'Districts Monitored', value: kpi.monitoringDistricts ?? 30 },
            { label: 'Last Updated', value: lastUpdated ? formatDateTime(lastUpdated) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className={`p-3 rounded-xl ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
              <p className={`font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(({ title, description, icon: Icon, count, unit, filename, data }) => (
          <div
            key={title}
            className={`rounded-2xl p-5 shadow-sm border flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
              </div>
            </div>
            <p className={`text-xs mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {count} {unit} available
            </p>
            <button
              onClick={() => downloadCsv(data, filename)}
              disabled={!data.length}
              className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} /> Download CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
