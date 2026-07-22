import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell
} from 'recharts';
import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHART_TOOLTIP_STYLE, downloadCsv } from '../utils/helpers';

const CHART_COLORS = {
  heatIndex: '#f97316',
  temperature: '#ef4444',
  humidity: '#0ea5e9',
  windSpeed: '#14b8a6',
  maxTemp: '#dc2626',
  avgTemp: '#3b82f6',
};

function ChartCard({ title, children, data, filename, darkMode }) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
        {data?.length > 0 && (
          <button
            onClick={() => downloadCsv(data, `${filename || title.replace(/\s+/g,'_')}.csv`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 transition-colors"
          >
            <Download size={12} /> Export
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// Heat Index Trend
export function HeatIndexTrend({ data }) {
  const { darkMode } = useApp();
  const chartData = (data || []).slice(-30).map(d => ({
    date: d.date?.slice(5),
    heatIndex: d.avgHeatIndex,
    max: d.maxTemperature
  }));

  return (
    <ChartCard title="🔥 Heat Index Trend" data={chartData} filename="heat_index_trend" darkMode={darkMode}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#94a3b8' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#94a3b8' }} tickLine={false} axisLine={false} unit="°" />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={46} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Danger', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={41} stroke="#ea580c" strokeDasharray="4 4" label={{ value: 'Extreme Caution', fill: '#ea580c', fontSize: 10, position: 'insideTopRight' }} />
          <Line type="monotone" dataKey="heatIndex" name="Heat Index" stroke={CHART_COLORS.heatIndex} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// Temperature Trend
export function TemperatureTrend({ data }) {
  const { darkMode } = useApp();
  const chartData = (data || []).slice(-30).map(d => ({
    date: d.date?.slice(5),
    avgTemp: d.avgTemperature,
    maxTemp: d.maxTemperature
  }));

  return (
    <ChartCard title="🌡️ Temperature Trend" data={chartData} filename="temperature_trend" darkMode={darkMode}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.temperature} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.temperature} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="°" />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="maxTemp" name="Max Temp" stroke={CHART_COLORS.maxTemp} fill="url(#tempGrad)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="avgTemp" name="Avg Temp" stroke={CHART_COLORS.avgTemp} strokeWidth={2} dot={false} strokeDasharray="5 3" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// Humidity Trend
export function HumidityTrend({ data }) {
  const { darkMode } = useApp();
  const chartData = (data || []).slice(-30).map(d => ({
    date: d.date?.slice(5),
    humidity: d.avgHumidity
  }));

  return (
    <ChartCard title="💧 Humidity Trend" data={chartData} filename="humidity_trend" darkMode={darkMode}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="humidity" name="Avg Humidity" stroke={CHART_COLORS.humidity} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// Wind Speed Trend
export function WindSpeedTrend({ data }) {
  const { darkMode } = useApp();
  const chartData = (data || []).slice(-30).map(d => ({
    date: d.date?.slice(5),
    wind: d.avgWindSpeed
  }));

  return (
    <ChartCard title="💨 Wind Speed Trend" data={chartData} filename="wind_trend" darkMode={darkMode}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.windSpeed} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.windSpeed} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit=" km/h" />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="wind" name="Wind Speed" stroke={CHART_COLORS.windSpeed} fill="url(#windGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// District Ranking Bar Chart
export function DistrictRankingChart({ data }) {
  const { darkMode } = useApp();
  const chartData = (data || []).map(d => ({
    name: d.district?.length > 10 ? d.district.slice(0, 10) + '…' : d.district,
    heatIndex: d.heatIndex,
    temperature: d.temperature
  }));

  return (
    <ChartCard title="🏆 Top 10 Districts by Heat Index" data={data} filename="district_ranking" darkMode={darkMode}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} unit="°" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} tickLine={false} width={80} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="heatIndex" name="Heat Index" fill={CHART_COLORS.heatIndex} radius={[0, 4, 4, 0]} />
          <Bar dataKey="temperature" name="Temperature" fill={CHART_COLORS.temperature} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// Risk Distribution Donut
export function RiskDistributionChart({ data }) {
  const { darkMode } = useApp();

  const RCOLORS = {
    'Normal': '#16a34a', 'Caution': '#ca8a04',
    'Extreme Caution': '#ea580c', 'Danger': '#dc2626', 'Extreme Danger': '#7f1d1d'
  };

  const pieData = (data || []).filter(d => d.value > 0);

  return (
    <ChartCard title="📊 Risk Distribution" data={data} filename="risk_distribution" darkMode={darkMode}>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
              {pieData.map((entry, index) => (
                <Cell key={index} fill={RCOLORS[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {pieData.map(entry => (
            <div key={entry.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: RCOLORS[entry.name] }} />
                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{entry.name}</span>
              </div>
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

// 7-Day Forecast Chart
export function ForecastChart({ data, district }) {
  const { darkMode } = useApp();
  const filteredData = district && district !== 'All'
    ? (data || []).filter(d => d.district === district)
    : (data || []).filter(d => d.district === 'Khordha');

  const chartData = filteredData.map(d => ({
    date: d.forecastDate?.slice(5),
    predictedHI: d.predictedHeatIndex,
    predictedTemp: d.predictedTemperature,
    confidence: d.confidence
  }));

  return (
    <ChartCard title="📅 7-Day Forecast" data={chartData} filename="forecast" darkMode={darkMode}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="°" />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v, n) => [v + (n === 'Confidence' ? '%' : '°C'), n]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="predictedHI" name="Heat Index" stroke={CHART_COLORS.heatIndex} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.heatIndex }} />
          <Line type="monotone" dataKey="predictedTemp" name="Temperature" stroke={CHART_COLORS.temperature} strokeWidth={2} dot={false} strokeDasharray="5 3" />
          <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#94a3b8" strokeWidth={1} dot={false} strokeDasharray="2 4" yAxisId="right" hide />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
